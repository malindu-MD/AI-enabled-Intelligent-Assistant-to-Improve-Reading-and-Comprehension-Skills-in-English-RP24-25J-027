from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pydantic import BaseModel
from transformers import T5Tokenizer, T5ForConditionalGeneration

# Initialize FastAPI app
app = FastAPI()

# Enable CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change this in production)
    allow_credentials=False,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Load the fine-tuned model and tokenizer
model_path = "./t5-small-finetuned"
model = T5ForConditionalGeneration.from_pretrained(model_path)
tokenizer = T5Tokenizer.from_pretrained(model_path)

class GenerateRequest(BaseModel):
    level: str
    topic: str

@app.post("/generate/")
async def generate_paragraph_and_mcq(request: GenerateRequest):
    level = request.level
    topic = request.topic

    # Prepare the input text
    input_text = f"Generate a paragraph and MCQ for Level {level} and Topic {topic}. The output must strictly follow this format: Paragraph: <paragraph text> MCQ: Question: <question> Options: <options> Answer: <answer>"
    inputs = tokenizer(input_text, return_tensors="pt")

    # Generate output with sampling
    outputs = model.generate(
        inputs["input_ids"],
        max_length=128,
        do_sample=True,  # Enable sampling
        top_k=100,        # Limit sampling to the top-k tokens
        top_p=0.95,      # Nucleus sampling (top-p sampling)
        temperature=0.8, # Control randomness (higher = more random)
        num_return_sequences=1,  # Number of sequences to generate
    )
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Parse the generated text into paragraph and MCQ
    try:
        if "Paragraph:" in generated_text and "MCQ:" in generated_text:
            paragraph = generated_text.split("Paragraph:")[1].split("MCQ:")[0].strip()
            mcq = generated_text.split("MCQ:")[1].strip()
            return {"paragraph D": paragraph, "mcq D": mcq}
        else:
            if "Question:" in generated_text and "Options:" in generated_text and "Answer:" in generated_text:
                paragraph = generated_text.split("Question:")[0].strip()
                mcq = f"Question: {generated_text.split('Question:')[1].strip()}"
                return {"paragraph": paragraph, "mcq": mcq}
            else:
                raise HTTPException(status_code=500, detail="Unexpected output format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing error: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "MCQ Generator API is running!"}
