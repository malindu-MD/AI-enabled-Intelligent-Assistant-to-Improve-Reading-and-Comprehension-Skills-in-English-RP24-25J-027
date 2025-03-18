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

class McqQueryRequest(BaseModel):
    level: str  # A1, A2, B1, etc.
    preferences: str  # Example: "Technology", "Sports"

class TenMcq(BaseModel):
    level: str  # A1, A2, B1, etc.
    preferences: str  # Example: "Technology", "Sports"

class ExplainRequest(BaseModel):
    level: str  # A1, A2, B1, etc.
    preferences: str  # Example: "Technology", "Sports"
    word:str


genai.configure(api_key="AIzaSyDU5z69qVaIYtrBXEjRB_GZPXP4mfOIpRo")  # Ensure you have the correct API key for Gemini
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





@router.post("/fillintheblank/")
async def getexplain(query_request: QueryRequest):
    query_text = query_request.word
    result = query_pinecone(query_text)

    preferences="Hindi Film"
    level="Beginner"

    
    if result['matches']:
        matches = []
        for match in result['matches']:
            word = match['metadata']['word']
            definition = match['metadata']['definition']
            example = match['metadata']['example']
           
           
            
            prompt_template = f"""
            You are an expert in English vocabulary. Your task is to create a fill-in-the-blank question based on the student's level and preferences. First, retrieve the basic definition of the word and then adjust the explanation based on the student's level and their specific interests.

            1. Retrieve the basic definition of the word, including its synonyms, antonyms, and example usage.
            2. Tailor the fill-in-the-blank question based on the student's level:
                - For **A1 (Beginner)**: Simple sentence with a basic word context, focusing on everyday situations.
                - For **A2 (Elementary)**: Simple sentence with more context and vocabulary expansion. The question should be easy but more varied than A1.
                - For **B1 (Intermediate)**: A moderately complex sentence with a focus on describing experiences or events.
                - For **B2 (Upper-Intermediate)**: A more complex sentence with broader vocabulary and deeper context.
                - For **C1 (Advanced)**: A challenging sentence, using idiomatic expressions or complex sentence structures.
                - For **C2 (Proficient)**: A highly complex sentence, requiring nuanced understanding of the word in various contexts.

            3. Personalize the fill-in-the-blank sentence based on the student's preferences. For example, if the student is interested in **Technology**, use a tech-related context in the question.

            Given the following information:
            - **Word**: ```{word}```
            - **Definition**: ```{definition}```
            - **Example**: ```{example}```
            - **Student Preferences**: ```{preferences}```
            - **Student Level**: ```{level}```

            Your task is to:
            1. **Provide a fill-in-the-blank question** with a sentence where the word is missing.
            2. The sentence should have a blank represented by ```[____]``` where the student must fill in the correct word.
            3. Provide four options for the fill-in-the-blank question. The correct answer should be one of the options, and do not repeat the word in the options.
            4. **Provide an explanation** of why the correct answer is right, and why the other options are incorrect, adjusted based on the student's preferences and level.

            For **Level-specific questions**:
            - **A1 (Beginner)**: Simple and familiar context, such as using common objects or actions like “dog”, “apple”, or “run”.
            - **A2 (Elementary)**: Contexts that include daily routines and simple personal conversations.
            - **B1 (Intermediate)**: Simple but engaging sentences with words that describe experiences, ambitions, or basic situations.
            - **B2 (Upper-Intermediate)**: Sentences that are a bit more challenging, incorporating vocabulary related to work or social settings.
            - **C1 (Advanced)**: Complex sentences using sophisticated vocabulary, idiomatic expressions, or more abstract contexts.
            - **C2 (Proficient)**: Sentences requiring advanced vocabulary, with nuanced meanings or challenging contexts.

            For the explanation:
            - If the student is interested in **Technology**, use tech-related explanations and examples.
            - If the student is interested in **Pop Culture**, refer to cultural examples, etc.

            Example Output in JSON format:
            ```json
            {{
                "question": "When the kids received their gifts, they were [____]!",
                "option1": "sad",
                "option2": "happy",
                "option3": "angry",
                "option4": "bored",
                "correct_answer": "Option 2",
                "explanation": "For a Beginner (A1), the correct answer is 'happy' because it describes a positive feeling. When kids receive gifts, they often feel happy. In this case, the other options are incorrect as they do not fit the context of feeling pleased."
            }}
            ```

            Your response should include the question, four options, the correct answer, and the explanation in the format described above.
        """


            ques_response = model.generate_content(prompt_template)

            response_dict = json.loads(ques_response.text)
   
            print(ques_response.text)

            
        

        return JSONResponse(response_dict)
    else:
        return JSONResponse(content={"message": f"No matches found for '{query_text}'"}, status_code=404)







@router.post("/fillintheblankten/")
async def generate_mcq(query_request: McqQueryRequest):
   
    student_level = query_request.level  # A1, A2, B1, etc.
    student_preferences = query_request.preferences  # e.g., "Technology", "Sports"

    if student_level == "Beginner":
        student_level="A1 and A2"
    elif student_level == "Elementary":
        student_level="A2 and B1"
    elif student_level == "Intermediate":
        student_level="B1 and B2"
    elif student_level == "Upper-Intermediate":
        student_level="B2 and C1"
    elif student_level == "Advanced":
        student_level="C1 and C2"
    elif student_level == "Proficient":
        pstudent_level="C2"

    word_prompt = f"""
    You are an expert in English vocabulary. Based on a student's level and interests, suggest **10 words** that are suitable for vocabulary improvement.

    - **Student Level**: {student_level}
    - **Student Preferences**: {student_preferences}

    The words should be:
    1. **Common for the level** (e.g., A1 gets simple words like "apple", "run", "big").
    2. **Related to the student's preferences** (e.g., if preference is "Technology", use tech-related words).
    3. **Mixed with these types of vocabulary**:
        - Nouns
        - Verbs
        - Adjectives
        - Adverbs
        - Pronouns
        - Prepositions
        - Conjunctions
        - Interjections
        - Determiners

    The words should cover a variety of types, ensuring they align with the student's level and preferences. Each word should be appropriate for the student's learning stage and their interests.

    Return JSON format:
    ```json
    {{
        "words": ["word1", "word2", ..., "word10"]
    }}
    ```
    """

    word_response = model.generate_content(word_prompt)
    word_list = json.loads(word_response.text)["words"]
  
    mcq_list = []

    for word in word_list:
    
        result = query_pinecone(word)# Function to query the vector database
            
        if not result['matches']:
            continue  # Skip words that don't have relevant information   

        match = result['matches'][0]  # Assume first match is the best
        definition = match['metadata']['definition']
        example = match['metadata']['example']

        prompt_template = f"""
        You are an expert in English vocabulary. Your task is to create a fill-in-the-blank question based on the student's level and preferences. First, retrieve the basic definition of the word and then adjust the explanation based on the student's level and their specific interests.

        1. Retrieve the basic definition of the word, including its synonyms, antonyms, and example usage.
        2. Tailor the fill-in-the-blank question based on the student's level:
            - For **A1 (Beginner)**: Simple sentence with a basic word context, focusing on everyday situations.
            - For **A2 (Elementary)**: Simple sentence with more context and vocabulary expansion. The question should be easy but more varied than A1.
            - For **B1 (Intermediate)**: A moderately complex sentence with a focus on describing experiences or events.
            - For **B2 (Upper-Intermediate)**: A more complex sentence with broader vocabulary and deeper context.
            - For **C1 (Advanced)**: A challenging sentence, using idiomatic expressions or complex sentence structures.
            - For **C2 (Proficient)**: A highly complex sentence, requiring nuanced understanding of the word in various contexts.

        3. Personalize the fill-in-the-blank sentence based on the student's preferences. For example, if the student is interested in **Technology**, use a tech-related context in the question.

        Given the following information:
        - **Word**: ```{word}```
        - **Definition**: ```{definition}```
        - **Example**: ```{example}```
        - **Student Preferences**: ```{student_preferences}```
        - **Student Level**: ```{student_level}```

        Your task is to:
        1. **Provide a fill-in-the-blank question** with a sentence where the word is missing.
        2. The sentence should have a blank represented by ```[____]``` where the student must fill in the correct word.
        3. Provide four options for the fill-in-the-blank question. The correct answer should be one of the options, and do not repeat the word in the options.
        4. **Provide an explanation** of why the correct answer is right, and why the other options are incorrect, adjusted based on the student's preferences and level.

        For **Level-specific questions**:
        - **A1 (Beginner)**: Simple and familiar context, such as using common objects or actions like “dog”, “apple”, or “run”.
        - **A2 (Elementary)**: Contexts that include daily routines and simple personal conversations.
        - **B1 (Intermediate)**: Simple but engaging sentences with words that describe experiences, ambitions, or basic situations.
        - **B2 (Upper-Intermediate)**: Sentences that are a bit more challenging, incorporating vocabulary related to work or social settings.
        - **C1 (Advanced)**: Complex sentences using sophisticated vocabulary, idiomatic expressions, or more abstract contexts.
        - **C2 (Proficient)**: Sentences requiring advanced vocabulary, with nuanced meanings or challenging contexts.

        For the explanation:
        - If the student is interested in **Technology**, use tech-related explanations and examples.
        - If the student is interested in **Pop Culture**, refer to cultural examples, etc.

        Example Output in JSON format:
        ```json
        {{
            "question": "When the kids received their gifts, they were [____]!",
            "option1": "sad",
            "option2": "happy",
            "option3": "angry",
            "option4": "bored",
            "correct_answer": "Option 2",
            "explanation": "For a Beginner (A1), the correct answer is 'happy' because it describes a positive feeling. When kids receive gifts, they often feel happy. In this case, the other options are incorrect as they do not fit the context of feeling pleased."
        }}
        ```

        Your response should include the question, four options, the correct answer, and the explanation in the format described above.
        """


        ques_response = model.generate_content(prompt_template)

        response_dict = json.loads(ques_response.text)
    
        mcq_list.append(response_dict)

                
            

    if mcq_list:
       return JSONResponse(mcq_list)
    else:
       return JSONResponse(content={"message": "No valid MCQs generated"}, status_code=404)



@router.post("/wordexplanation/")
async def getexplain(query_request: ExplainRequest):
    query_text = query_request.word
    result = query_pinecone(query_text)
    student_preferences=query_request.preferences
    student_level=query_request.level

    
    if result['matches']:
        matches = []
        for match in result['matches']:
            word = match['metadata']['word']
            definition = match['metadata']['definition']
            example = match['metadata']['example']
            typee=match['metadata']['type']
            cefr=match['metadata']['type']
            related_Words=match['metadata']['related Words']
            

            personalized_explanation = f"""
            You are an expert in English vocabulary. Your task is to explain the word based on the student's preferences and level. First, retrieve the basic definition of the word and then adjust the explanation based on the student's level and their specific interests.

            1. Retrieve the basic definition of the word, including its synonyms, antonyms, and example usage.
            2. Tailor the explanation based on the student's level. For example:
                - For **Beginner**: Use simple language, everyday examples, and avoid complex synonyms.
                - For **Elementary**: Use slightly more complex phrases and give examples using familiar terms.
                - For **Intermediate**: Provide additional context, related examples, synonyms, and antonyms where applicable.
                - For **Upper-Intermediate**: Use nuanced language, explore figurative meanings, and offer multiple examples in various contexts.
                - For **Advanced**: Provide complex examples, explore deeper meanings, and discuss advanced nuances of the word.
                - For **Proficient**: Use highly sophisticated examples, rare nuances, and academic or technical language.
            3. Personalize the explanation based on the student's preferences. For example, if the student is interested in **Technology**, use relevant tech-related examples for the word's usage.

            Given the following information:
            - **word definition**: ```{definition}```
            - **related_Words**: ```{related_Words}```
            - **Student Preferences**: ```{student_preferences}```
            - **Student knowledge Level**: ```{student_level}```

            Your response should:
            1. **Provide the basic definition** of the word.
            2. **Tailor the explanation** based on the student's level.
            3. **Personalize the explanation** based on the student's preferences.

            Finally, format your response in the following JSON structure:
            ```json
            {{
                "personalized_explanation": "Your personalized explanation based on the student's level and preferences."
            }}
            ```
        """


           
           
            
           


            ques_response = model.generate_content(personalized_explanation)

            response_dict = json.loads(ques_response.text)
   
            print(ques_response.text)

            
        

        return JSONResponse(response_dict)
    else:
        return JSONResponse(content={"message": f"No matches found for '{query_text}'"}, status_code=404)





router.post("/TenmcqA/")
async def TenmcqA(query_request: McqQueryRequest):
    student_level = query_request.level  # A1, A2, B1, etc.
    student_preferences = query_request.preferences  # e.g., "Technology", "Sports"

    if student_level == "Beginner":
        student_level="A1 and A2"
    elif student_level == "Elementary":
        student_level="A2 and B1"
    elif student_level == "Intermediate":
        student_level="B1 and B2"
    elif student_level == "Upper-Intermediate":
        student_level="B2 and C1"
    elif student_level == "Advanced":
        student_level="C1 and C2"
    elif student_level == "Proficient":
        pstudent_level="C2"

    word_prompt = f"""
    You are an expert in English vocabulary. Based on a student's level and interests, suggest **10 words** that are suitable for vocabulary improvement.

    - **Student Level**: {student_level}
    - **Student Preferences**: {student_preferences}

    The words should be:
    1. **Common for the level** (e.g., A1 gets simple words like "apple", "run", "big").
    2. **Related to the student's preferences** (e.g., if preference is "Technology", use tech-related words).
    3. **Mixed with these types of vocabulary**:
        - Nouns
        - Verbs
        - Adjectives
        - Adverbs
        - Pronouns
        - Prepositions
        - Conjunctions
        - Interjections
        - Determiners

    The words should cover a variety of types, ensuring they align with the student's level and preferences. Each word should be appropriate for the student's learning stage and their interests.

    Return JSON format:
    ```json
    {{
        "words": ["word1", "word2", ..., "word10"]
    }}
    ```
    """

    word_response = model.generate_content(word_prompt)
    word_list = json.loads(word_response.text)["words"]
  
    mcq_list = []

    for word in word_list:
    
        result = query_pinecone(word)# Function to query the vector database
            
        if not result['matches']:
            continue  # Skip words that don't have relevant information   

        match = result['matches'][0]  # Assume first match is the best
        definition = match['metadata']['definition']
        example = match['metadata']['example']
        typee=match['metadata']['type']
        related_Words=match['metadata']['related Words']
        synonyms=match['metadata']['synonyms']
        antonyms=match['metadata']['antonyms']


        prompt_template = f"""
            You are an English vocabulary expert helping design a word association game. Your task is to create a challenging and fun game question based on the provided word, its definition, and an example sentence.

            For each game question:
            1. Provide three related words  (for example: synonym, antonym, or contextually related words also include this word ```{word}``` as a one of the three word).
            2. Provide four options for the player to choose from.
            3. The correct answer should be one of the three related words.
            3. Explain the relationship among the words you provided in a simple, clear manner.
            4. Do NOT repeat the given word in the game options.
            5. explanation should be according to student prefernce of  ```{student_preferences}```

            Given the following word, definition,related_Words,synonyms,antonyms and example sentence, generate a question with four options (Option 1 and Option 2 and Option 3 and Option 4) where the user has to select the correct answer based on the meaning or context of the word.

            Word:```{word}```
            Definition: ```{definition}```
            Example:```{example}```
            related_Words:```{related_Words}```
            synonyms:```{synonyms}```
            antonyms:```{antonyms}```

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
    
        mcq_list.append(response_dict)

                
            

    if mcq_list:
       return JSONResponse(mcq_list)
    else:
       return JSONResponse(content={"message": "No valid MCQs generated"}, status_code=404)
    




@router.post("/relatedmcq/", tags=["MCQ"], response_model=dict)
async def relatedmcq(query_request: TenMcq):
    student_level = query_request.level  # A1, A2, B1, etc.
    student_preferences = query_request.preferences  # e.g., "Technology", "Sports"

    if student_level == "Beginner":
        student_level="A1 and A2"
    elif student_level == "Elementary":
        student_level="A2 and B1"
    elif student_level == "Intermediate":
        student_level="B1 and B2"
    elif student_level == "Upper-Intermediate":
        student_level="B2 and C1"
    elif student_level == "Advanced":
        student_level="C1 and C2"
    elif student_level == "Proficient":
        pstudent_level="C2"

    word_prompt = f"""
    You are an expert in English vocabulary. Based on a student's level and interests, suggest **10 words** that are suitable for vocabulary improvement.

    - **Student Level**: {student_level}
    - **Student Preferences**: {student_preferences}

    The words should be:
    1. **Common for the level** (e.g., A1 gets simple words like "apple", "run", "big").
    2. **Related to the student's preferences** (e.g., if preference is "Technology", use tech-related words).
    3. **Mixed with these types of vocabulary**:
        - Nouns
        - Verbs
        - Adjectives
        - Adverbs
        - Pronouns
        - Prepositions
        - Conjunctions
        - Interjections
        - Determiners

    The words should cover a variety of types, ensuring they align with the student's level and preferences. Each word should be appropriate for the student's learning stage and their interests.

    Return JSON format:
    ```json
    {{
        "words": ["word1", "word2", ..., "word10"]
    }}
    ```
    """

    word_response = model.generate_content(word_prompt)
    word_list = json.loads(word_response.text)["words"]
  
    mcq_list = []

    for word in word_list:
    
        result = query_pinecone(word)# Function to query the vector database
            
        if not result['matches']:
            continue  # Skip words that don't have relevant information   

        match = result['matches'][0]  # Assume first match is the best
        definition = match['metadata']['definition']
        example = match['metadata']['example']
        typee=match['metadata']['type']
        related_Words=match['metadata']['related Words']
        synonyms=match['metadata']['synonyms']
        antonyms=match['metadata']['antonyms']


        prompt_template = f"""
        You are an English vocabulary expert helping design a word association game. Your task is to create a challenging and fun game question based on the provided word, its definition, and an example sentence.

        **Game Rules:**
        1. **Include the given word** and **two additional related words** (either synonyms, antonyms, or contextually related words).
        2. **Provide four answer options.** One of the options should be the correct answer, which is related to the three words in the question.
        3. **Ensure the correct answer is associated** with all three words in meaning or context.
        4. **You Should Ensure All the word level ```{student_level}``` .
        4. **Do NOT repeat the given word** in the answer options.
        5. **Explain the relationship** between the correct answer and the three given words.
        6. **The explanation should align with the student's preferences:** ```{student_preferences}```.

        **Game Question Format:**
        Given the following word, definition, synonyms, antonyms, and example sentence, generate a multiple-choice question where the player selects the correct answer based on word association.

        - **Word:** ```{word}```
        - **Definition:** ```{definition}```
        - **Example Sentence:** ```{example}```
        - **Related Words:** ```{related_Words}```
        - **Synonyms:** ```{synonyms}```
        - **Antonyms:** ```{antonyms}```

        **Question:**
        "Which word is most closely associated with the words [{word}, related_word_1, related_word_2]?"

        **Options:**
        - **Option 1:** [First option]
        - **Option 2:** [Second option]
        - **Option 3:** [Third option]
        - **Option 4:** [Fourth option]

        **Correct Answer:** The word that best connects to **all three words** in the question.

        **Explanation:** A brief explanation of how the correct answer relates to the three words.

        **JSON Output Schema:**
        ```json
        {{
            "question": "Which word is most closely associated with [{word}, related_word_1, related_word_2]?",
            "option1": "First option",
            "option2": "Second option",
            "option3": "Third option",
            "option4": "Fourth option",
            "correct_answer": "Option number (1-4)",
            "explanation": "How the correct answer relates to the three given words."
        }}
        ```

        **Example Output:**
        ```json
        {{
            "question": "Which word is most closely associated with [ball, bounce, court]?",
            "option1": "net",
            "option2": "bat",
            "option3": "bounce",
            "option4": "player",
            "correct_answer": "option3",
            "explanation": "A ball is used in sports, it bounces, and is often played on a court. 'Bounce' directly connects to all three."
        }}
        ```
        """



        ques_response = model.generate_content(prompt_template)

        response_dict = json.loads(ques_response.text)
    
        mcq_list.append(response_dict)

                
            

    if mcq_list:
       return JSONResponse(mcq_list)
    else:
       return JSONResponse(content={"message": "No valid MCQs generated"}, status_code=404)
    