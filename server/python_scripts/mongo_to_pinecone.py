import os
import unicodedata
from dotenv import load_dotenv
from pymongo import MongoClient
from pinecone import Pinecone
from tqdm import tqdm
import json
import re

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client['england']
collection = db['londons']

# Pinecone setup
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_INDEX = 'travelplaner'  # your index name

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX)

def normalize_ascii(text):
    """
    Özel karakterleri ASCII'ye çevirir ve boşlukları _ ile değiştirir.
    """
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'\W+', '_', text)  # Özel karakterleri _ ile değiştir
    return text

def prepare_text_for_embedding(nlp_data):
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
            clean_entity = normalize_ascii(entity)  # ASCII formatına çevir
            text = f"{entity_type} - {entity}: {context[:100]}..."  # Metni kısalt
            entity_texts.append((clean_entity, text))

    return entity_texts  # [(entity, text), (entity, text), ...]

def process_and_upload():
    documents = collection.find({"nlpAnalysis": {"$exists": True}})
    total_docs = collection.count_documents({"nlpAnalysis": {"$exists": True}})
    
    print(f"NLP analizi içeren {total_docs} doküman bulundu")
    
    batch_size = 100
    current_batch = []
    
    for doc in tqdm(documents, total=total_docs):
        nlp_data = doc['nlpAnalysis']
        doc_id = str(doc['_id'])

        # NLP verisini işleyerek her entity için ayrı metinler al
        entity_texts = prepare_text_for_embedding(nlp_data)

        for entity, text in entity_texts:
            entity_id = f"{doc_id}_{entity}"  # Her entity için ASCII ID oluştur
            
            # Dummy (geçici) vektör oluştur
            dummy_vector = [0.1] + [0.0] * 1535  # 1536 boyutlu vektör

            vector_record = {
                'id': entity_id,
                'values': dummy_vector,
                'metadata': {
                    'source': 'mongodb_england_londons',
                    'original_id': doc_id,
                    'entity': entity,
                    'text_for_embedding': text  # Varlık için kısaltılmış metin
                }
            }
            
            current_batch.append(vector_record)
            
            if len(current_batch) >= batch_size:
                try:
                    index.upsert(
                        vectors=current_batch,
                        namespace="england_londons"
                    )
                    print(f"{len(current_batch)} vektör içeren batch yüklendi")
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
            print(f"Son batch'teki {len(current_batch)} vektör yüklendi")
        except Exception as e:
            print(f"Son batch yüklenirken hata oluştu: {e}")
            return
    
    print("Yükleme işlemi başarıyla tamamlandı!")

if __name__ == "__main__":
    process_and_upload()
