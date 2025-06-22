import os
import unicodedata
import openai
from dotenv import load_dotenv
from pymongo import MongoClient
from pinecone import Pinecone
from tqdm import tqdm
import json
import re
import time
from typing import List, Tuple

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URI = "mongodb+srv://emir:emir123488@cluster0.c9sgw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client['england']
collection = db['londons']

# Pinecone setup
PINECONE_API_KEY = "pcsk_bYjoj_3oCK1N9pCRXLyfjzi2dQF3XKhq1JVuQzkXmE7zbXjfLSv8CpneUUsMRnYNagMyU"
PINECONE_INDEX = 'travelplaner'

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX)

# OpenAI setup
OPENAI_API_KEY = "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"
if not OPENAI_API_KEY:
    raise RuntimeError("Please set the OPENAI_API_KEY environment variable")

openai.api_key = OPENAI_API_KEY

def normalize_ascii(text):
    """
    Özel karakterleri ASCII'ye çevirir ve boşlukları _ ile değiştirir.
    """
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'\W+', '_', text)
    return text

def embed_text(text: str) -> List[float]:
    """
    OpenAI API kullanarak metin için embedding oluşturur.
    Rate limiting için retry mekanizması içerir.
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
                wait_time = (2 ** attempt) * 1  # Exponential backoff
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

def prepare_text_for_embedding(nlp_data) -> List[Tuple[str, str]]:
    """
    NLP verisinden her varlık (entity) için ayrı bir metin oluşturur.
    """
    entity_texts = []

    if isinstance(nlp_data, str):
        try:
            nlp_data = json.loads(nlp_data)
        except json.JSONDecodeError:
            return []

    for entity_type, entities in nlp_data.get('entities_context', {}).items():
        for entity, context in entities.items():
            clean_entity = normalize_ascii(entity)
            # Daha uzun ve anlamlı bir metin oluştur
            text = f"{entity_type}: {entity}. Context: {context}"
            entity_texts.append((clean_entity, text))

    return entity_texts

def process_and_upload():
    documents = collection.find({"nlpAnalysis": {"$exists": True}})
    total_docs = collection.count_documents({"nlpAnalysis": {"$exists": True}})
    
    print(f"NLP analizi içeren {total_docs} doküman bulundu")
    
    batch_size = 50  # OpenAI rate limiting için daha küçük batch
    current_batch = []
    processed_count = 0
    
    for doc in tqdm(documents, total=total_docs):
        nlp_data = doc['nlpAnalysis']
        doc_id = str(doc['_id'])

        # NLP verisini işleyerek her entity için ayrı metinler al
        entity_texts = prepare_text_for_embedding(nlp_data)

        for entity, text in entity_texts:
            entity_id = f"{doc_id}_{entity}"
            
            try:
                # Gerçek embedding oluştur
                print(f"Embedding oluşturuluyor: {entity}")
                embedding_vector = embed_text(text)
                
                vector_record = {
                    'id': entity_id,
                    'values': embedding_vector,
                    'metadata': {
                        'source': 'mongodb_england_londons',
                        'original_id': doc_id,
                        'entity': entity,
                        'text_for_embedding': text[:500],  # Metadata boyut sınırı için kısalt
                        'full_text': text  # Tam metin de saklanabilir
                    }
                }
                
                current_batch.append(vector_record)
                processed_count += 1
                
                # Rate limiting için kısa bekleme
                time.sleep(0.1)
                
            except Exception as e:
                print(f"Entity {entity} için embedding oluşturulamadı: {e}")
                continue
            
            # Batch boyutuna ulaştığında Pinecone'a yükle
            if len(current_batch) >= batch_size:
                try:
                    index.upsert(
                        vectors=current_batch,
                        namespace="england_londons"
                    )
                    print(f"{len(current_batch)} gerçek embedding içeren batch yüklendi")
                    current_batch = []
                except Exception as e:
                    print(f"Batch yüklenirken hata oluştu: {e}")
                    return
    
    # Kalan batch varsa yükle
    if current_batch:
        try:
            index.upsert(
                vectors=current_batch,
                namespace="england_londons"
            )
            print(f"Son batch'teki {len(current_batch)} embedding yüklendi")
        except Exception as e:
            print(f"Son batch yüklenirken hata oluştu: {e}")
            return
    
    print(f"Yükleme işlemi başarıyla tamamlandı! Toplam {processed_count} embedding oluşturuldu ve yüklendi!")

def test_single_embedding():
    """
    Tek bir doküman için test embedding'i oluşturur.
    """
    print("Test için tek bir embedding oluşturuluyor...")
    doc = collection.find_one({"nlpAnalysis": {"$exists": True}})
    if doc:
        entity_texts = prepare_text_for_embedding(doc['nlpAnalysis'])
        if entity_texts:
            entity, text = entity_texts[0]
            print(f"Test metni: {text[:100]}...")
            embedding = embed_text(text)
            print(f"Embedding boyutu: {len(embedding)}")
            print(f"İlk 5 değer: {embedding[:5]}")
        else:
            print("Test için uygun entity bulunamadı")
    else:
        print("Test için doküman bulunamadı")

if __name__ == "__main__":
    # Önce test yapabilirsiniz
    # test_single_embedding()
    
    # Ana işlemi başlat
    process_and_upload()