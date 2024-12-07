from sentence_transformers import SentenceTransformer

def get_sentence_model():
    return SentenceTransformer('all-distilroberta-v1')