import spacy
import sys
import json
import torch
from transformers import AutoTokenizer, AutoModelForTokenClassification
from transformers import pipeline
import nltk
from nltk.tokenize import sent_tokenize

# NLTK'nin gerekli verilerini indir
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

# spaCy modelini global olarak yükle
nlp = spacy.load("en_core_web_lg")

# BERT-NER modelini yükle
tokenizer = AutoTokenizer.from_pretrained("dbmdz/bert-large-cased-finetuned-conll03-english")
model = AutoModelForTokenClassification.from_pretrained("dbmdz/bert-large-cased-finetuned-conll03-english")
ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple")

def extract_entities_with_bert(text):
    """
    BERT-NER kullanarak varlıkları çıkar
    """
    # Metni cümlelere ayır
    sentences = sent_tokenize(text)
    
    # Her cümle için varlıkları çıkar
    entities = {
        "ORG": [],      # Organizasyonlar
        "LOC": [],      # Lokasyonlar
        "PER": [],      # Kişiler
        "MISC": []      # Diğer
    }
    
    sentence_entities = {}
    
    for sentence in sentences:
        try:
            # BERT-NER ile varlıkları bul
            ner_results = ner_pipeline(sentence)
            
            # Varlıkları kategorilerine göre ayır
            for item in ner_results:
                entity_text = item['word']
                entity_type = item['entity_group']
                score = item['score']
                
                # Sadece güven skoru 0.8'den yüksek olanları al
                if score > 0.8:
                    if entity_type == 'ORG' and entity_text not in entities['ORG']:
                        entities['ORG'].append(entity_text)
                        if 'ORG' not in sentence_entities:
                            sentence_entities['ORG'] = []
                        sentence_entities['ORG'].append(sentence)
                    
                    elif entity_type == 'LOC' and entity_text not in entities['LOC']:
                        entities['LOC'].append(entity_text)
                        if 'LOC' not in sentence_entities:
                            sentence_entities['LOC'] = []
                        sentence_entities['LOC'].append(sentence)
                    
                    elif entity_type == 'PER' and entity_text not in entities['PER']:
                        entities['PER'].append(entity_text)
                        if 'PER' not in sentence_entities:
                            sentence_entities['PER'] = []
                        sentence_entities['PER'].append(sentence)
                    
                    elif entity_type == 'MISC' and entity_text not in entities['MISC']:
                        entities['MISC'].append(entity_text)
                        if 'MISC' not in sentence_entities:
                            sentence_entities['MISC'] = []
                        sentence_entities['MISC'].append(sentence)
        
        except Exception as e:
            print(f"Hata: {str(e)}")
            continue
    
    return entities, sentence_entities

def extract_entities_with_spacy(text):
    """
    spaCy kullanarak varlıkları çıkar
    """
    doc = nlp(text)
    
    entities = {
        "ORG": [],  # Organizasyonlar
        "LOC": [],  # Coğrafi yerler
        "FAC": [],  # Yapılar
        "PRODUCT": [],  # Ürünler
        "WORK_OF_ART": [],  # Sanat eserleri
        "EVENT": []  # Etkinlikler
    }
    
    # Cümleleri liste olarak al
    sentences = list(doc.sents)
    sentence_entities = {}
    
    # Metindeki her bir entity'i kontrol et
    for i, sent in enumerate(sentences):
        for ent in sent.ents:
            if ent.label_ in entities:
                if ent.text not in entities[ent.label_]:
                    entities[ent.label_].append(ent.text)
                    
                    if ent.label_ not in sentence_entities:
                        sentence_entities[ent.label_] = []
                    
                    # Bir önceki, mevcut ve bir sonraki cümleleri al
                    prev_sent = sentences[i - 1].text.strip() if i > 0 else ""
                    next_sent = sentences[i + 1].text.strip() if i < len(sentences) - 1 else ""
                    context = f"{prev_sent} {sent.text.strip()} {next_sent}".strip()
                    
                    sentence_entities[ent.label_].append(context)
    
    return entities, sentence_entities

def combine_entity_results(bert_results, spacy_results):
    """
    BERT-NER ve spaCy sonuçlarını birleştir ve her entity için ilgili cümleyi tek bir kez ekle.
    """
    combined_entities = {}
    combined_sentences = {}

    # BERT sonuçlarını ekle
    bert_entities, bert_sentences = bert_results
    for key in bert_entities:
        combined_entities.setdefault(key, []).extend(bert_entities[key])
        if key in bert_sentences:
            combined_sentences.setdefault(key, {})
            for entity, sentence in zip(bert_entities[key], bert_sentences[key]):
                if entity not in combined_sentences[key]:
                    combined_sentences[key][entity] = sentence + "\n\n"

    # spaCy sonuçlarını ekle
    spacy_entities, spacy_sentences = spacy_results
    for key in spacy_entities:
        combined_entities.setdefault(key, []).extend(spacy_entities[key])
        if key in spacy_sentences:
            combined_sentences.setdefault(key, {})
            for entity, sentence in zip(spacy_entities[key], spacy_sentences[key]):
                if entity not in combined_sentences[key]:
                    combined_sentences[key][entity] = sentence + "\n\n"

    # Tekrar eden öğeleri kaldır
    for key in combined_entities:
        combined_entities[key] = list(set(combined_entities[key]))

    return {
        "entities_context": combined_sentences  # Her entity için tek bir örnek cümle
    }


if __name__ == "__main__":
    # Stdin'den JSON formatında metin al
    input_text = sys.stdin.read()
    
    try:
        # JSON'ı parse et
        data = json.loads(input_text)
        text = data.get("text", "")
        
        # Her iki modelle de varlıkları çıkar
        bert_results = extract_entities_with_bert(text)
        spacy_results = extract_entities_with_spacy(text)
        
        # Sonuçları birleştir
        result = combine_entity_results(bert_results, spacy_results)
        
        # Sonucu JSON olarak yazdır
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}") 