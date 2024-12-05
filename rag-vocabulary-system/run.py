import openai
from pinecone import Pinecone, ServerlessSpec
import torch
import streamlit as st
from transformers import AutoTokenizer, AutoModel
from langchain.prompts import PromptTemplate
from sentence_transformers import SentenceTransformer
from langchain.chains import LLMChain
from langchain.llms import OpenAI
from langchain.embeddings import OpenAIEmbeddings
from transformers import AutoTokenizer, AutoModel
import numpy as np
import pandas as pd

openai.api_key = "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"
pc = Pinecone(api_key="pcsk_fiSLY_TamiPFSRvuqT1EYWizEQzBQaLSuZw4CQPJESJsmed2hmGNTDi345wVzAQk8LzEf")


index_name = "quickstart"

tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-distilroberta-v1")
model = AutoModel.from_pretrained("sentence-transformers/all-distilroberta-v1")
index = pc.Index(index_name)


def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    embeddings = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
    return embeddings

name=get_embedding('malindudilshan')
print(name)


llm = OpenAI(temperature=0.7,openai_api_key="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")
# LangChain Prompt Template for generating clarifying questions
clarification_prompt = """
You are playing a word guessing game with a user. You have the following information:
- Word: {word}
- Definition: {definition}
- Previous user answers: {answers}
Please generate a clarifying question to help the AI guess the word. The question should be based on the definition and previous answers.
"""
prompt = PromptTemplate(template=clarification_prompt, input_variables=["word", "definition", "answers"])
chain = LLMChain(llm=llm, prompt=prompt)


def retrieve_similar_words(clue):
    clue_embedding = get_embedding(clue)
    query_response = index.query(
        vector=clue_embedding.tolist(),
        top_k=3,
        include_metadata=True
    )
    similar_words = [
        {
            'word': match['metadata']['word'],
            'definition': match['metadata']['definition'],
            'example': match['metadata']['example']
        }
        for match in query_response['matches']
    ]
    return similar_words

def generate_ai_guess(similar_words):
    return similar_words[0]['word']  # First similar word as guess



st.title("Taboo AI Game with RAG")
st.subheader("Guess the Word")

# Initialize conversation context
previous_answers = []

# Main game loop
def play_game():
    target_word = st.text_input("Enter the target word:", "")
    taboo_words = st.text_input("Enter taboo words (comma-separated):", "").split(",")
    
    if st.button("Start Game"):
        st.session_state.guess_attempts = 0  # Reset attempts
        
        # Show taboo words
        st.write(f"Taboo words: {', '.join(taboo_words)}")
        
        # Player provides a clue
        player_clue = st.text_input("Provide a clue for the AI to guess the word:")
        
        if player_clue:
            # Retrieve similar words from Pinecone
            similar_words = retrieve_similar_words(player_clue)
            ai_guess = generate_ai_guess(similar_words)
            st.write(f"AI's Guess: {ai_guess}")
            
            # Check if AI guessed correctly
            if ai_guess.lower() == target_word.lower():
                st.write("AI guessed the word correctly!")
            else:
                st.write("AI couldn't guess the word.")
                
                # Ask clarifying questions if AI's guess is incorrect
                question = chain.run(word=similar_words[0]['word'], 
                                     definition=similar_words[0]['definition'], 
                                     answers=str(previous_answers))
                st.write(f"Taboo AI: {question}")
                
                # Get player's response to clarifying question
                user_response = st.text_input("Your response (yes/no):")
                if user_response.lower() == "yes":
                    previous_answers.append(f"Q: {question} | A: yes")
                    st.write(f"Answer recorded. Keep playing.")
                else:
                    previous_answers.append(f"Q: {question} | A: no")
                    st.write(f"Answer recorded. Keep playing.")

# Start the game in Streamlit UI
play_game()


