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

@app.post("/predict")
def predict(textlist: TextList):
    preds, probas = model.predict_decode(textlist.texts)

    response = []
    for text, pred, proba in zip(textlist.texts, preds, probas):
        feedback_prompt = f"""
        You are an English teacher. A student wrote the following sentence:

        "{text}"

        Their vocabulary level is estimated as **{pred}** based on the CEFR scale.
        Give a short paragraph (3–4 sentences) that:
        1. Clearly explains what this CEFR level means in simple words,
        2. Encourages the student by highlighting their strengths,
        3. Suggests one or two ways to improve vocabulary or sentence quality.

        Avoid technical terms. Make it easy to understand. Be positive and supportive.
        """

        feedback = modelLLM.generate_content(feedback_prompt).text.strip()

        row = {
            "text": text,
            "level": pred,
            "scores": proba,
            "feedback": feedback
        }
        response.append(row)

    return response
