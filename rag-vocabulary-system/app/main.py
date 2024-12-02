from fastapi import FastAPI
from app.api.query import router as query_router

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World "}

app.include_router(query_router)