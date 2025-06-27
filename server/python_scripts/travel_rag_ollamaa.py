import openai
import pinecone
import requests
import json
import re
from typing import List, Dict, Tuple
import nltk
from nltk.tokenize import sent_tokenize
import time
import sys

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
        
        self.pc = pinecone.Pinecone(api_key=pinecone_api_key)
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
        # Split query into sentences
        sentences = self.chunk_user_input(user_query)
        
        all_results = []
        seen_ids = set()  # Prevent duplicates
        
        # Process each sentence
        for i, sentence in enumerate(sentences):
            try:
                # Create embedding
                sentence_embedding = self.embed_text(sentence)
                
                # Search for similar content
                matches = self.search_similar_content(sentence_embedding, top_k_per_sentence)
                
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
                continue
        
        # Sort by score and return top results
        all_results.sort(key=lambda x: x['score'], reverse=True)
        return all_results[:max_total_results]
    
    def generate_response_with_ollama(self, user_query: str, context: List[Dict], travel_params: Dict = None) -> str:
        """
        Generate response using Ollama LLM with retrieved context and travel parameters
        """
        # Prepare context for the prompt
        context_text = ""
        for i, item in enumerate(context[:5], 1):  # Limit to top 5 contexts
            context_text += f"Source {i}: {item['entity']}\n"
            context_text += f"Info: {item['text'][:200]}...\n\n"
        
        # Create a detailed prompt using travel parameters if available
        travel_params_text = ""
        if travel_params:
            travel_params_text = f"""
Travel Parameters:
- Location: {travel_params.get('location', 'Not specified')}
- Budget: {travel_params.get('budget', 'Not specified')}
- Number of People: {travel_params.get('personCount', 'Not specified')}
- Interests: {', '.join(travel_params.get('interests', [])) if isinstance(travel_params.get('interests'), list) else travel_params.get('interests', 'Not specified')}
- Duration: {travel_params.get('holidayDays', 'Not specified')} days
"""

        # Enhanced prompt with travel parameters
        prompt = f"""You are a helpful travel assistant for London and England. Based on the travel information and specific requirements provided, create a detailed and personalized travel recommendation.

User Query: {user_query}

{travel_params_text}

Travel Information:
{context_text}

Please provide a comprehensive travel recommendation that considers:
1. The specified budget and trip duration
2. Activities and attractions suitable for the group size
3. Experiences matching the stated interests
4. Practical tips for maximizing the budget
5. Suggested daily itinerary breakdown

Respond in a friendly and informative way, being specific and practical with your suggestions."""

        try:
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 800
                    }
                },
                timeout=180
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('response', '').strip()
                
                if ai_response:
                    return ai_response
                else:
                    return "I received an empty response. Let me try to help you with general travel advice for London."
            else:
                return f"Sorry, I encountered an error (HTTP {response.status_code}). Please try again."
                
        except requests.exceptions.Timeout:
            return "The response generation took too long. Please try again with a simpler query."
        except requests.exceptions.ConnectionError:
            return "Cannot connect to the AI model. Please ensure Ollama is running properly."
        except Exception as e:
            return f"An unexpected error occurred: {str(e)}"
    
    def get_travel_recommendations(self, user_query: str, travel_params: Dict = None) -> Dict:
        """
        Main method to get travel recommendations using RAG + Ollama
        """
        print("🚀 Starting Travel RAG + Ollama Process...")
        print("=" * 80)
        
        # Create enhanced query using travel parameters
        enhanced_query = user_query
        if travel_params:
            interests = travel_params.get('interests', [])
            if isinstance(interests, str):
                interests = [interests]
            
            location = travel_params.get('location', '')
            if location:
                enhanced_query = f"{enhanced_query} in {location}"
            
            if interests:
                interests_str = ', '.join(interests)
                enhanced_query = f"{enhanced_query} with interests in {interests_str}"
        
        # Step 1: Retrieve relevant context
        context = self.retrieve_context(enhanced_query)
        
        if not context:
            return {
                'query': user_query,
                'enhanced_query': enhanced_query,
                'context_found': False,
                'travel_params': travel_params,
                'response': "I couldn't find specific information in my database for your query. However, I'd be happy to provide general travel advice for London/England. Could you please be more specific about what you're looking for?"
            }
        
        # Step 2: Generate response using Ollama with travel parameters
        response = self.generate_response_with_ollama(user_query, context, travel_params)
        
        return {
            'query': user_query,
            'enhanced_query': enhanced_query,
            'context_found': True,
            'num_contexts': len(context),
            'context_details': context,
            'travel_params': travel_params,
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
        import sys
        import json

        # Check if running from command line with arguments
        if len(sys.argv) > 2:
            user_query = sys.argv[1]
            travel_params = json.loads(sys.argv[2])
            
            # Initialize the system
            rag_system = TravelRAGWithOllama()
            
            # Get recommendations
            result = rag_system.get_travel_recommendations(user_query, travel_params)
            
            # Print only the JSON result
            print(json.dumps(result, ensure_ascii=False))
            sys.exit(0)
            
        else:
            # Interactive mode for testing
            rag_system = TravelRAGWithOllama()
            
            while True:
                user_query = input("\nEnter your query (or 'exit' to quit): ")
                if user_query.lower() == 'exit':
                    break
                    
                result = rag_system.get_travel_recommendations(user_query)
                print(json.dumps(result, ensure_ascii=False, indent=2))
    
    except Exception as e:
        error_response = {
            "error": str(e),
            "status": "error"
        }
        print(json.dumps(error_response, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()