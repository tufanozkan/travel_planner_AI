import openai
from pinecone import Pinecone
import requests
import json
import re
from typing import List, Dict, Tuple
import nltk
from nltk.tokenize import sent_tokenize
import time

# Download NLTK data if not available
try:
    sent_tokenize("test sentence")
except LookupError:
    print("NLTK 'punkt' not found. Downloading...")
    nltk.download('punkt')
    print("'punkt' downloaded successfully.")

class TravelRAGWithOllama:
    def __init__(self, ollama_base_url: str = "http://localhost:11434"):
        """
        Initialize the Travel RAG system with Ollama integration
        """
        # Setup OpenAI for embeddings
        self.openai_api_key = "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"
        if not self.openai_api_key:
            raise RuntimeError("Please set the OPENAI_API_KEY environment variable")
        openai.api_key = self.openai_api_key
        
        # Setup Pinecone
        pinecone_api_key = "pcsk_bYjoj_3oCK1N9pCRXLyfjzi2dQF3XKhq1JVuQzkXmE7zbXjfLSv8CpneUUsMRnYNagMyU"
        if not pinecone_api_key:
            raise RuntimeError("Please set the PINECONE_API_KEY environment variable")
        
        self.pc = Pinecone(api_key=pinecone_api_key)
        self.index = self.pc.Index('travelplaner')
        self.namespace = "england_londons"
        
        # Setup Ollama
        self.ollama_base_url = ollama_base_url
        self.model_name = "llama3.2"  # Using Ollama 3.2
        
        # Test Ollama connection
        self._test_ollama_connection()
    
    def _test_ollama_connection(self):
        """Test if Ollama is running and accessible"""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=10)
            if response.status_code == 200:
                models = response.json().get('models', [])
                model_names = [model['name'] for model in models]
                print(f"✓ Ollama connection successful. Available models: {model_names}")
                
                # Check if our target model is available - more flexible matching
                available_model = None
                for model_name in model_names:
                    if 'llama3.2' in model_name.lower() or 'llama3' in model_name.lower():
                        available_model = model_name
                        break
                
                if available_model:
                    self.model_name = available_model
                    print(f"✓ Using model: {self.model_name}")
                else:
                    print(f"⚠ Warning: llama3.2 model not found. Available models: {model_names}")
                    if model_names:
                        self.model_name = model_names[0]  # Use first available model
                        print(f"✓ Using fallback model: {self.model_name}")
                    else:
                        print("❌ No models available. Attempting to pull llama3.2...")
                        self._pull_model()
            else:
                raise ConnectionError(f"Failed to connect to Ollama: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"⚠ Connection test failed: {e}")
            print("Assuming Ollama is running and continuing...")
    
    def _pull_model(self):
        """Pull the required model if not available"""
        try:
            print(f"Pulling {self.model_name} model... This may take a while.")
            response = requests.post(
                f"{self.ollama_base_url}/api/pull",
                json={"name": self.model_name},
                stream=True,
                timeout=300
            )
            
            for line in response.iter_lines():
                if line:
                    data = json.loads(line.decode('utf-8'))
                    if 'status' in data:
                        print(f"Status: {data['status']}")
                    if data.get('status') == 'success':
                        print(f"✓ {self.model_name} model pulled successfully!")
                        break
        except Exception as e:
            print(f"Failed to pull model: {e}")
            raise
    
    def chunk_user_input(self, user_input: str) -> List[str]:
        """
        Split user input into sentences for better processing
        """
        sentences = sent_tokenize(user_input)
        
        # Filter and clean sentences
        cleaned_sentences = []
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 10:  # Filter very short sentences
                cleaned_sentences.append(sentence)
        
        return cleaned_sentences
    
    def embed_text(self, text: str) -> List[float]:
        """
        Create embeddings using OpenAI API
        """
        max_retries = 3
        for attempt in range(max_retries):
            try:
                resp = openai.embeddings.create(
                    model="text-embedding-ada-002",
                    input=text
                )
                return resp.data[0].embedding
            except openai.RateLimitError:
                if attempt < max_retries - 1:
                    wait_time = (2 ** attempt) * 1
                    print(f"Rate limit hit, waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    raise
            except Exception as e:
                print(f"Embedding error (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                else:
                    raise
    
    def search_similar_content(self, query_embedding: List[float], top_k: int = 5) -> List[Dict]:
        """
        Search for similar content in Pinecone
        """
        try:
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                namespace=self.namespace,
                include_metadata=True
            )
            
            return results['matches']
        except Exception as e:
            print(f"Pinecone search error: {e}")
            return []
    
    def retrieve_context(self, user_query: str, top_k_per_sentence: int = 3, max_total_results: int = 8) -> List[Dict]:
        """
        Retrieve relevant context for the user query
        """
        print(f"🔍 Processing query: {user_query}\n")
        
        # Split query into sentences
        sentences = self.chunk_user_input(user_query)
        print(f"📝 Split into {len(sentences)} sentences:")
        for i, sentence in enumerate(sentences, 1):
            print(f"  {i}. {sentence}")
        print()
        
        all_results = []
        seen_ids = set()  # Prevent duplicates
        
        # Process each sentence
        for i, sentence in enumerate(sentences):
            print(f"⚡ Processing sentence {i+1}: {sentence[:50]}...")
            
            try:
                # Create embedding
                sentence_embedding = self.embed_text(sentence)
                
                # Search for similar content
                matches = self.search_similar_content(sentence_embedding, top_k_per_sentence)
                
                print(f"📊 Found {len(matches)} matches for sentence {i+1}")
                
                # Process results and filter duplicates
                for match in matches:
                    if match['id'] not in seen_ids:
                        seen_ids.add(match['id'])
                        
                        result = {
                            'id': match['id'],
                            'score': match['score'],
                            'entity': match['metadata'].get('entity', ''),
                            'text': match['metadata'].get('text_for_embedding', ''),
                            'full_text': match['metadata'].get('full_text', ''),
                            'original_id': match['metadata'].get('original_id', ''),
                            'query_sentence': sentence,
                            'sentence_index': i + 1
                        }
                        all_results.append(result)
                
                # Rate limiting
                time.sleep(0.1)
                
            except Exception as e:
                print(f"❌ Error processing sentence {i+1}: {e}")
                continue
        
        # Sort by score and return top results
        all_results.sort(key=lambda x: x['score'], reverse=True)
        final_results = all_results[:max_total_results]
        
        print(f"✅ Retrieved top {len(final_results)} relevant contexts\n")
        return final_results
    
    def generate_response_with_ollama(self, user_query: str, context: List[Dict]) -> str:
        """
        Generate response using Ollama LLM with retrieved context
        """
        print(f"🔍 Preparing context from {len(context)} sources...")
        
        # Prepare context for the prompt
        context_text = ""
        for i, item in enumerate(context[:5], 1):  # Limit to top 5 contexts
            context_text += f"Source {i}: {item['entity']}\n"
            context_text += f"Info: {item['text'][:200]}...\n\n"
        
        # Simplified and more direct prompt
        prompt = f"""You are a helpful travel assistant for London and England. Based on the travel information provided, answer the user's question in a friendly and informative way.

User Question: {user_query}

Travel Information:
{context_text}

Please provide a helpful travel recommendation in English. Be specific and practical."""

        try:
            print("🤖 Generating response with Ollama...")
            print(f"📝 Using model: {self.model_name}")
            
            # Test with a simple request first
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 500
                    }
                },
                timeout=120
            )
            
            print(f"📊 Response status code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('response', '').strip()
                
                if ai_response:
                    print("✅ Response generated successfully!")
                    return ai_response
                else:
                    return "I received an empty response. Let me try to help you with general travel advice for London."
            else:
                print(f"❌ Error response: {response.text}")
                return f"Sorry, I encountered an error (HTTP {response.status_code}). Please try again."
                
        except requests.exceptions.Timeout:
            print("⏰ Request timed out")
            return "The response generation took too long. Please try again with a simpler query."
        except requests.exceptions.ConnectionError:
            print("🔌 Connection error")
            return "Cannot connect to the AI model. Please ensure Ollama is running properly."
        except Exception as e:
            print(f"💥 Unexpected error: {str(e)}")
            return f"An unexpected error occurred: {str(e)}"
    
    def get_travel_recommendations(self, user_query: str) -> Dict:
        """
        Main method to get travel recommendations using RAG + Ollama
        """
        print("🚀 Starting Travel RAG + Ollama Process...")
        print("=" * 80)
        
        # Step 1: Retrieve relevant context
        context = self.retrieve_context(user_query)
        
        if not context:
            return {
                'query': user_query,
                'context_found': False,
                'response': "I couldn't find specific information in my database for your query. However, I'd be happy to provide general travel advice for London/England. Could you please be more specific about what you're looking for?"
            }
        
        # Step 2: Generate response using Ollama
        response = self.generate_response_with_ollama(user_query, context)
        
        return {
            'query': user_query,
            'context_found': True,
            'num_contexts': len(context),
            'context_details': context,
            'response': response
        }
    
    def print_formatted_response(self, result: Dict):
        """
        Print the response in a nicely formatted way
        """
        print("\n" + "=" * 80)
        print("🎯 TRAVEL RECOMMENDATION RESPONSE")
        print("=" * 80)
        
        print(f"📋 Query: {result['query']}")
        print(f"📊 Contexts Used: {result['num_contexts'] if result['context_found'] else 0}")
        print("\n" + "🤖 AI Response:")
        print("-" * 40)
        print(result['response'])
        
        if result['context_found']:
            print("\n" + "📚 Source Information:")
            print("-" * 40)
            for i, ctx in enumerate(result['context_details'][:3], 1):  # Show top 3 sources
                print(f"{i}. {ctx['entity']} (Score: {ctx['score']:.3f})")
                print(f"   {ctx['text'][:100]}...")
        
        print("=" * 80)

def main():
    """
    Main function to run the Travel RAG + Ollama system
    """
    try:
        # Initialize the system
        print("🔧 Initializing Travel RAG + Ollama System...")
        
        # Test Ollama connection first
        test_response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if test_response.status_code != 200:
            print("❌ Cannot connect to Ollama. Please ensure it's running.")
            return
        
        models = test_response.json().get('models', [])
        print(f"📋 Available Ollama models: {[m['name'] for m in models]}")
        
        rag_system = TravelRAGWithOllama()
        print("✅ System initialized successfully!\n")
        
        # Simple test first
        print("🧪 Testing Ollama with simple query...")
        test_response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": rag_system.model_name,
                "prompt": "Hello, please respond with 'AI is working' in English.",
                "stream": False
            },
            timeout=30
        )
        
        if test_response.status_code == 200:
            test_result = test_response.json()
            print(f"✅ Ollama test successful: {test_result.get('response', 'No response')}")
        else:
            print(f"❌ Ollama test failed: {test_response.status_code}")
            print(f"Response: {test_response.text}")
        
        # Sample test queries
        test_queries = [
            "I want to visit historical places in London and try local food",
            "Looking for outdoor activities and nature spots near London",
            "I'm interested in museums and cultural experiences in England",
            "Planning a budget trip to London with family, need kid-friendly places",
            "What are the best neighborhoods to stay in London for first-time visitors?"
        ]
        
        print("\n🌍 TRAVEL RAG + OLLAMA SYSTEM")
        print("=" * 50)
        
        while True:
            print("\n📋 Options:")
            print("1. Enter custom travel query")
            print("2. Test with sample queries")
            print("3. Test Ollama connection")
            print("4. Exit")
            
            choice = input("\n🔢 Choose an option (1-4): ").strip()
            
            if choice == "1":
                user_query = input("\n✈️  Enter your travel query: ").strip()
                if user_query:
                    result = rag_system.get_travel_recommendations(user_query)
                    rag_system.print_formatted_response(result)
            
            elif choice == "2":
                print("\n🧪 Testing with sample queries...\n")
                for i, query in enumerate(test_queries, 1):
                    print(f"\n{'='*60}")
                    print(f"🧪 TEST QUERY {i}")
                    print(f"{'='*60}")
                    
                    result = rag_system.get_travel_recommendations(query)
                    rag_system.print_formatted_response(result)
                    
                    if i < len(test_queries):
                        input("\n⏸️  Press Enter to continue to next test...")
            
            elif choice == "3":
                print("\n🔧 Testing Ollama connection...")
                try:
                    test_resp = requests.post(
                        "http://localhost:11434/api/generate",
                        json={
                            "model": rag_system.model_name,
                            "prompt": "Say 'Connection test successful!' in English.",
                            "stream": False
                        },
                        timeout=20
                    )
                    if test_resp.status_code == 200:
                        result = test_resp.json()
                        print(f"✅ Test Response: {result.get('response', 'No response')}")
                    else:
                        print(f"❌ Test failed: HTTP {test_resp.status_code}")
                        print(f"Response body: {test_resp.text}")
                except Exception as e:
                    print(f"❌ Connection test error: {e}")
            
            elif choice == "4":
                print("👋 Goodbye! Happy travels!")
                break
            
            else:
                print("❌ Invalid choice. Please select 1, 2, 3, or 4.")
    
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()