from fastapi import FastAPI
from app.api.query import router 

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World "}



@app.get("/word")
def getNewHint():
    # function logic
    return {"message": "New hint"}


app.include_router(router)
