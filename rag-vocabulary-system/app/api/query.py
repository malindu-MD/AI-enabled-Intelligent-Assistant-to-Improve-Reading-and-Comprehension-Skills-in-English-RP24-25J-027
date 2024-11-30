from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.utils.pinecone_utils import query_pinecone
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import requests
import json
import re
from typing import Dict
import google.generativeai as genai


router = APIRouter()

class QueryRequest(BaseModel):
    word: str


genai.configure(api_key="AIzaSyAlKsAhncUVeS1OhRsJm89woUQQ8XHt8kQ")  # Ensure you have the correct API key for Gemini
model = genai.GenerativeModel("gemini-1.5-flash")  # Use the correct model variant

@router.post("/wordhint/")
async def getHintFromTheWord(query_request: QueryRequest):
    query_text = query_request.word
    result = query_pinecone(query_text)
    
    if result['matches']:
        matches = []
        for match in result['matches']:
            word = match['metadata']['word']
            definition = match['metadata']['definition']
            example = match['metadata']['example']
           
           
            full_response = []
            prompt_template="""
            You are a bot that makes a short hint for the given word, its definition, and example. 
            The hint must be a very brief description of the word without any extra details or unrelated information. 
            It should not use the word itself or any extra details beyond what is necessary to understand the meaning. 
            Make it clear and student-friendly.
            The hint should not include word directly Meaning

            Word: {word}
            Definition and example: {definition}, {example}
            """
           

           



            prompt = PromptTemplate(input_variables=["word", "definition", "example"], template=prompt_template)
            formatted_prompt = prompt.format(word=word, definition=definition, example=example)


            
            response = model.generate_content(formatted_prompt)
            print(response.text)

        #     url='http://localhost:11434/api/generate'

        #     data={
        #        "model": "llama3.2",
        #        "prompt": formatted_prompt
        #     }

        #     headers={'Content-Type':'application/json'}

        #     response=requests.post(url,data=json.dumps(data),headers=headers,stream=True)

        #     try:
        #       for line in response.iter_lines():
        # # filter out keep-alive new lines
        #         if line:
        #            decoded_line = json.loads(line.decode('utf-8'))
        #     # print(decoded_line['response'])  # uncomment to results, token by token
        #            full_response.append(decoded_line['response'])
        #     finally:  
        #          response.close()
            

        #     print(''.join(full_response))



        return JSONResponse(content={"Hint": response.text})
    else:
        return JSONResponse(content={"message": f"No matches found for '{query_text}'"}, status_code=404)



@router.post("/associate/")
async def getAssociationGame(query_request: QueryRequest):
    query_text = query_request.word
    result = query_pinecone(query_text)
    
    if result['matches']:
        matches = []
        for match in result['matches']:
            word = match['metadata']['word']
            definition = match['metadata']['definition']
            example = match['metadata']['example']
           
           
            
            prompt_template = """
            You are an English vocabulary expert helping design a word association game. Your task is to create a challenging and fun game question based on the provided word, its definition, and an example sentence.

            For each game question:
            1. Provide three related words (for example: synonym, antonym, or contextually related words).
            2. Provide two options for the player to choose from.
            3. Explain the relationship among the words you provided in a simple, clear manner.
            4. Do NOT repeat the given word in the game options.

            Given the following word, definition, and example sentence, generate a question with two options (Option 1 and Option 2) where the user has to select the correct answer based on the meaning or context of the word.

            Word: {word}
            Definition: {definition}
            Example: {example}

            Question: Which word shares a similar meaning or context to the given word above?
            Options:
            Option 1: [First option]
            Option 2: [Second option]
            Correct Answer: [Option number, Option 1 or Option 2]
            """
   

            

            prompt = PromptTemplate(input_variables=["word", "definition", "example"], template=prompt_template)
            formatted_prompt = prompt.format(word=word, definition=definition, example=example)
            

            

            # Create the LLMChain to process the prompt with the model
            response = model.generate_content(formatted_prompt)
          
           




           



            


          

        #     url='http://localhost:11434/api/generate'

        #     data={
        #        "model": "llama3.2",
        #        "prompt": formatted_prompt
        #     }

        #     headers={'Content-Type':'application/json'}

        #     response=requests.post(url,data=json.dumps(data),headers=headers,stream=True)

        #     try:
        #       for line in response.iter_lines():
        # # filter out keep-alive new lines
        #         if line:
        #            decoded_line = json.loads(line.decode('utf-8'))
        #     # print(decoded_line['response'])  # uncomment to results, token by token
        #            full_response.append(decoded_line['response'])
        #     finally:  
        #          response.close()
            

        #     print(''.join(full_response))



        return JSONResponse(content={"game_question": response.text})
    else:
        return JSONResponse(content={"message": f"No matches found for '{query_text}'"}, status_code=404)