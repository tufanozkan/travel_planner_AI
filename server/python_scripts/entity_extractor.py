import spacy
import sys
import json
import torch
from transformers import AutoTokenizer, AutoModelForTokenClassification
from transformers import pipeline
import nltk
from nltk.tokenize import sent_tokenize
import re

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

def extract_relevant_sentence(sentence, entity):
    """
    Cümleyi sadece entity'yi içeren kısmına kadar kısaltır.
    """
    match = re.search(rf"{re.escape(entity)}.*?[.!?]", sentence)
    return match.group() if match else sentence

def extract_entities_with_bert(text):
    sentences = sent_tokenize(text)
    entities = {"ORG": [], "LOC": [], "PER": [], "MISC": []}
    sentence_entities = {}
    
    for sentence in sentences:
        try:
            ner_results = ner_pipeline(sentence)
            for item in ner_results:
                entity_text = item['word']
                entity_type = item['entity_group']
                score = item['score']
                
                if score > 0.8 and entity_text not in entities[entity_type]:
                    entities[entity_type].append(entity_text)
                    relevant_sentence = extract_relevant_sentence(sentence, entity_text)
                    sentence_entities.setdefault(entity_type, []).append(relevant_sentence)
        except Exception as e:
            print(f"Hata: {str(e)}")
            continue
    
    return entities, sentence_entities

def extract_entities_with_spacy(text):
    doc = nlp(text)
    entities = {"ORG": [], "LOC": [], "FAC": [], "PRODUCT": [], "WORK_OF_ART": [], "EVENT": []}
    sentence_entities = {}
    
    for sent in doc.sents:
        for ent in sent.ents:
            if ent.label_ in entities and ent.text not in entities[ent.label_]:
                entities[ent.label_].append(ent.text)
                relevant_sentence = extract_relevant_sentence(sent.text, ent.text)
                sentence_entities.setdefault(ent.label_, []).append(relevant_sentence)
    
    return entities, sentence_entities

def combine_entity_results(bert_results, spacy_results):
    combined_entities = {}
    combined_sentences = {}
    
    bert_entities, bert_sentences = bert_results
    for key in bert_entities:
        combined_entities.setdefault(key, []).extend(bert_entities[key])
        if key in bert_sentences:
            combined_sentences.setdefault(key, {}).update({entity: sent for entity, sent in zip(bert_entities[key], bert_sentences[key])})
    
    spacy_entities, spacy_sentences = spacy_results
    for key in spacy_entities:
        combined_entities.setdefault(key, []).extend(spacy_entities[key])
        if key in spacy_sentences:
            combined_sentences.setdefault(key, {}).update({entity: sent for entity, sent in zip(spacy_entities[key], spacy_sentences[key])})
    
    for key in combined_entities:
        combined_entities[key] = list(set(combined_entities[key]))
    
    return {"entities_context": combined_sentences}

if __name__ == "__main__":
    input_text = sys.stdin.read()
    try:
        data = json.loads(input_text)
        text = data.get("text", "")
        
        bert_results = extract_entities_with_bert(text)
        spacy_results = extract_entities_with_spacy(text)
        
        result = combine_entity_results(bert_results, spacy_results)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}")
