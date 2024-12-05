from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.utils.pinecone_utils import query_pinecone
from langchain.prompts import PromptTemplate ,ChatPromptTemplate
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
model = genai.GenerativeModel("gemini-1.5-flash", generation_config={
        "response_mime_type": "application/json"
    })  # Use the correct model variant

@router.post("/shortHint/")
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
You are an intelligent assistant that generates short and concise hints to help students understand and guess words. Your task is to create a  hint based on the given word, its definition, and an example sentence. 

The hint must:
1. Be a single, concise sentence.
2. Describe the word clearly without including the word itself.
3. Avoid adding any extra or unnecessary information.
4. Be student-friendly and easy to understand.
5. not include this {word} in hint

For the given input, generate only the hint. 

Input: 
Word: {word}
Definition: {definition}
Example: {example}

            """



           

           



            prompt = PromptTemplate(input_variables=["word", "definition", "example"], template=prompt_template)
            formatted_prompt = prompt.format(word=query_text, definition=definition, example=example)

            print(formatted_prompt)


            
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





@router.post("/associationGame/")
async def getAgame(query_request: QueryRequest):
    query_text = query_request.word
    result = query_pinecone(query_text)
    
    if result['matches']:
        matches = []
        for match in result['matches']:
            word = match['metadata']['word']
            definition = match['metadata']['definition']
            example = match['metadata']['example']
           
           
            
            prompt_template = f"""
            You are an English vocabulary expert helping design a word association game. Your task is to create a challenging and fun game question based on the provided word, its definition, and an example sentence.

            For each game question:
            1. Provide three related words  (for example: synonym, antonym, or contextually related words also include this word ```{word}``` as a one of the three word).
            2. Provide four options for the player to choose from.
            3. The correct answer should be one of the three related words.
            3. Explain the relationship among the words you provided in a simple, clear manner.
            4. Do NOT repeat the given word in the game options.

            Given the following word, definition, and example sentence, generate a question with four options (Option 1 and Option 2 and Option 3 and Option 4) where the user has to select the correct answer based on the meaning or context of the word.

            Word:```{word}```
            Definition: ```{definition}```
            Example:```{example}```

            Question: Which word shares a similar meaning or context to the given [```{word}```,word 2,word 3] above?
            Options:
            Option 1: [First option]
            Option 2: [Second option]
            Option 3: [Third option]
            Option 4: [Fourth option]
            Correct Answer: [Option number, Option 1 or Option 2 or Option 3 or Option 4]

            Using this JSON schema:
                game={{
                "question":str,
                "option1":str,
                "option2":str,
                "option3":str,
                "option4":str,
                "correct_answer":str,
                "explanation":str
                }}
            Return a `game`

**Task**:
Generate a game question in JSON format based on the following inputs:

Word: ```{word}```
Definition: ```{definition}```
Example: ```{example}```

Return the question, four options, the correct answer, and an explanation using the JSON schema format.

            """

            ques_response = model.generate_content(prompt_template)

            response_dict = json.loads(ques_response.text)
   
            print(ques_response.text)

            
        

        return JSONResponse(response_dict)
    else:
        return JSONResponse(content={"message": f"No matches found for '{query_text}'"}, status_code=404)







@router.post("/DescribeHint/")
async def getDescribeHintFromTheWord(query_request: QueryRequest):
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
You are an intelligent assistant that generates detail hints to help students understand and guess words. Your task is to create a detail  hint based on the given word, its definition, and an example sentence. 

The hint must:
1. concise sentence.
2. Describe the word clearly without including the word itself.
3. Avoid adding any extra or unnecessary information.
4. Be student-friendly and easy to understand.
5. not include this {word} in hint

For the given input, generate only the hint. 

Input: 
Word: {word}
Definition: {definition}
Example: {example}

            """



           

           



            prompt = PromptTemplate(input_variables=["word", "definition", "example"], template=prompt_template)
            formatted_prompt = prompt.format(word=query_text, definition=definition, example=example)

            print(formatted_prompt)


            
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
