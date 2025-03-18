from fastapi import FastAPI
from app.api.query import router
import logging
from app.api.retrieval import router2 
from app.models.embedding_model import embed_and_store
from app.api.retrieval import get_response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all domains (change to specific domains for security)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


logging.basicConfig(
    filename="app.log", 
    level=logging.DEBUG, 
    format="%(asctime)s - %(levelname)s - %(message)s"
)


app.include_router(router, prefix="/api/v1", tags=["Router"])
app.include_router(router2, prefix="/api/v1", tags=["Router2"])

@app.get("/")
def read_root():
    return {"message": "Hello World "}

    
@app.get("/malindu")
def read_root():
    return {"message": "Hello World "}





@app.post("/embed/")
def embed_data():
    try:
        # Log that the embedding process is starting
        logging.info("Starting the embedding process...")
        
        embed_and_store()

        logging.info("Embedding process completed successfully.")
        return {"message": "Data embedded successfully"}
    
    except Exception as e:
        # Log the exception details for debugging
        logging.error(f"Error occurred during embedding process: {e}")
        return {"message": f"Error occurred: {str(e)}"}






@app.get("/word")
def getNewHint():
    # function logic
    return {"message": "New hint"}


app.include_router(router)
