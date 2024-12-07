from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
import pandas as pd
from app.config import PINECONE_API_KEY, PINECONE_INDEX_NAME

# Initialize Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)
model = SentenceTransformer("all-distilroberta-v1")


# Create or connect to the index

def create_pinecone_index():
    name=PINECONE_INDEX_NAME,
    dimension=768, # Replace with your model dimensions
    metric="euclidean", # Replace with your model metric
    spec=ServerlessSpec(
        cloud="aws",
        region="us-east-1"
    )

def get_pinecone_index():
    return pc.Index(PINECONE_INDEX_NAME)


def generate_embeddings_and_upsert(df, batch_size=100):
    index = get_pinecone_index()
    vectors = []

    for i, row in tqdm(df.iterrows(), total=len(df), desc="Processing dataset"):
        word = row['word']
        definition = row['definition']
        example = row['example']
        
        # Combine definition and example to form context
        text = f"Definition: {definition} Example: {example}"
        
        # Get embedding for the combined text
        embedding = model.encode(text)

        # Prepare metadata
        metadata = {"word": word, "definition": definition, "example": example}

        # Append to vectors list
        vectors.append((str(i), embedding.tolist(), metadata))

        # Upsert in batches
        if len(vectors) >= batch_size:
            index.upsert(vectors)
            vectors = []  # Clear batch

    # Final upsert for remaining vectors
    if vectors:
        index.upsert(vectors)



def query_pinecone(query, top_k=1):
    index = get_pinecone_index()
    query_embedding = model.encode(query)  # Generate embedding for the query
    result = index.query(vector=query_embedding.tolist(), top_k=top_k, include_metadata=True)
    return result