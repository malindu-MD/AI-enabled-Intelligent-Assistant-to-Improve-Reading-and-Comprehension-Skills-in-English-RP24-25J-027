from sentence_transformers import SentenceTransformer
from pinecone import Pinecone as PineconeClient
from app.config import PINECONE_API_KEY
from app.data.data_loader import load_data

# Initialize Pinecone Client
pc = PineconeClient(api_key=PINECONE_API_KEY)

# Load Embedding Model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")  # 384-dimensional embeddings

# Batch Upsert Function with metadata
def batch_upsert(index, embeddings, texts, ids, batch_size=100):
    for i in range(0, len(embeddings), batch_size):
        batch = [
            (ids[j], embeddings[j], {"text": texts[j]})  # Important metadata
            for j in range(i, min(i + batch_size, len(embeddings)))
        ]
        index.upsert(batch)
        print(f"✅ Uploaded batch {i//batch_size + 1}/{-(-len(embeddings) // batch_size)}")

# Embed & Store Function
def embed_and_store():
    try:
        data, words = load_data()

        # Create or Verify Pinecone Index
        index_name = "quickstart"
        existing_indexes = [idx["name"] for idx in pc.list_indexes().get("indexes", [])]
        if index_name not in existing_indexes:
            pc.create_index(name=index_name, dimension=384, metric="cosine")

        index = pc.Index(index_name)

        # Generate embeddings for each piece of data
        embeddings = embedding_model.encode(data, batch_size=32).tolist()
        ids = [str(i) for i in range(len(data))]

        # Upload data to Pinecone with metadata
        batch_upsert(index, embeddings, data, ids, batch_size=100)

        print("✅ All embeddings successfully stored in Pinecone with metadata!")

    except Exception as e:
        print(f"❌ Error occurred: {e}")

if __name__ == "__main__":
    embed_and_store()
