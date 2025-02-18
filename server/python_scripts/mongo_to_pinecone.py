import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pinecone import Pinecone
from tqdm import tqdm
import json

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client['turkey']
collection = db['londons']

# Pinecone setup
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_INDEX = 'travelplaner'  # your index name

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX)

def prepare_text_for_embedding(nlp_data):
    # Eğer nlp_data bir string ise, JSON'a dönüştürmeye çalışıyoruz
    if isinstance(nlp_data, str):
        try:
            nlp_data = json.loads(nlp_data)
        except json.JSONDecodeError:
            return nlp_data  # Eğer JSON'a dönüştürülemezse olduğu gibi döndür

    # İç içe geçmiş dictionary verisini tek bir metin haline getiriyoruz
    text = ""
    for entity_type, entities in nlp_data.get('entities_context', {}).items():
        for entity, context in entities.items():
            # Eğer context çok uzun ise, 100 karakterle sınırlıyoruz
            text += f"{entity_type} - {entity}: {context[:100]}...\n"
    return text

def process_and_upload():
    # nlpAnalysis içeren tüm dokümanları getiriyoruz
    documents = collection.find({"nlpAnalysis": {"$exists": True}})
    total_docs = collection.count_documents({"nlpAnalysis": {"$exists": True}})
    
    print(f"NLP analizi içeren {total_docs} doküman bulundu")
    
    batch_size = 100
    current_batch = []
    
    for doc in tqdm(documents, total=total_docs):
        nlp_data = doc['nlpAnalysis']
        doc_id = str(doc['_id'])
        
        # Pinecone için metni hazırlıyoruz
        text = prepare_text_for_embedding(nlp_data)
        
        # Dummy (geçici) vektör oluşturuyoruz (Pinecone Assistant tarafından daha sonra güncellenecek)
        dummy_vector = [0.1] + [0.0] * 1535  # 1536 boyutlu standart vektör
        
        # Vektör kaydını oluşturuyoruz
        vector_record = {
            'id': doc_id,
            'values': dummy_vector,
            'metadata': {
                'source': 'mongodb_turkey_londons',
                'original_id': doc_id,
                'text_for_embedding': text  # Kısaltılmış metni ekliyoruz
                # 'raw_nlp_data' alanını çıkardık, çünkü boyutu çok büyük olabilir
            }
        }
        
        current_batch.append(vector_record)
        
        # Batch boyutu batch_size'a ulaştığında verileri yüklüyoruz
        if len(current_batch) >= batch_size:
            try:
                index.upsert(
                    vectors=current_batch,
                    namespace="turkey_londons"
                )
                print(f"{len(current_batch)} vektör içeren batch yüklendi")
                current_batch = []
            except Exception as e:
                print(f"Batch yüklenirken hata oluştu: {e}")
                return
    
    # Kalan batch varsa yüklüyoruz
    if current_batch:
        try:
            index.upsert(
                vectors=current_batch,
                namespace="turkey_londons"
            )
            print(f"Son batch'teki {len(current_batch)} vektör yüklendi")
        except Exception as e:
            print(f"Son batch yüklenirken hata oluştu: {e}")
            return
    
    print("Yükleme işlemi başarıyla tamamlandı!")
    
if __name__ == "__main__":
    process_and_upload()
