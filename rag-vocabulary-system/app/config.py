import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
MODEL_NAME = "meta-llama/Llama-3.2-1B-Instruct"
SENTENCE_TRANSFORMER = "all-distilroberta-v1"
PINECONE_INDEX_NAME = "quickstart"
