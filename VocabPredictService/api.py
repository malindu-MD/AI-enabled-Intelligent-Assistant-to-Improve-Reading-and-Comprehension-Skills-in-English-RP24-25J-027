from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from inference import Model
import google.generativeai as genai
import os


# Configure Gemini


genai.configure(api_key="AIzaSyDU5z69qVaIYtrBXEjRB_GZPXP4mfOIpRo")  # Ensure you have the correct API key for Gemini
modelLLM = genai.GenerativeModel("gemini-1.5-flash")  # Use the correct model variant


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domains for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = Model("cefr_predictor/models/xgboost.joblib")

class TextList(BaseModel):
    texts: List[str] = []

# @app.get("/malindu")
# def read_root():
#     return {"message": "Hello World "}

# @app.get("/dilshan")
# def read_root():
#     return {"message": "it is working "}


@app.post("/predict")
def predict(textlist: TextList):
    preds, probas = model.predict_decode(textlist.texts)

    response = []
    for text, pred, proba in zip(textlist.texts, preds, probas):
        feedback_prompt = f"""
        You are a supportive English teacher helping a student grow their language skills.

        The student wrote the following sentence:
        "{text}"

        Their current vocabulary level is estimated as **{pred}** on the CEFR scale.

        Write a short, encouraging paragraph (3–4 sentences) that:
        1. Explains what the {pred} level means in simple, friendly language.
        2. Praises the student for what they did well.
        3. Gives 2 specific tips to help them improve their vocabulary and move toward the next CEFR level.
        4. Suggests one resource or habit (like reading, using flashcards, or watching shows) to help them learn new words.

        Avoid technical terms. Be easy to understand, kind, and helpful.
        """

        feedback = modelLLM.generate_content(feedback_prompt).text.strip()
        feedback=feedback + " you're ready to keep building your skills. To help you improve and move to the next stage, try out the vocabulary games available in this app according to your next level. "
        row = {
            "text": text,
            "level": pred,
            "scores": proba,
            "feedback": feedback
        }
        response.append(row)

    return response
