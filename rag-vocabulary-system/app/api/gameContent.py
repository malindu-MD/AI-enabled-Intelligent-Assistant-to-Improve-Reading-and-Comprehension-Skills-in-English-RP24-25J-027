from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.utils.pinecone_utils import query_pinecone
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.chat_models import ChatGoogleGenerativeAI
import json

router = APIRouter()

# Initialize the LLM (Gemini via LangChain)
llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.7)

# Request Models
class QueryRequest(BaseModel):
    word: str

class McqQueryRequest(BaseModel):
    level: str
    preferences: str

class TenMcq(BaseModel):
    level: str
    preferences: str

class ExplainRequest(BaseModel):
    level: str
    preferences: str
    word: str

# Utility for building LLMChain response
def generate_response(prompt_template: PromptTemplate, variables: dict):
    chain = LLMChain(llm=llm, prompt=prompt_template)
    return chain.run(**variables)

# Agent: Hint Generator
@router.post("/shortHint/")
async def get_hint(query_request: QueryRequest):
    result = query_pinecone(query_request.word)
    if not result['matches']:
        return JSONResponse(content={"message": f"No matches found for '{query_request.word}'"}, status_code=404)

    match = result['matches'][0]['metadata']
    prompt = PromptTemplate(
        input_variables=["word", "definition", "example"],
        template="""
        You are an assistant generating concise hints for vocabulary words.
        Rules:
        1. Be a single sentence.
        2. Do not use the word itself.
        3. Keep it student-friendly.

        Word: {word}
        Definition: {definition}
        Example: {example}

        Output: Hint
        """
            )
            response = generate_response(prompt, {
                "word": match['word'],
                "definition": match['definition'],
                "example": match['example']
            })
            return JSONResponse(content={"Hint": response.strip()})

        # Agent: Detailed Hint Generator
        @router.post("/DescribeHint/")
        async def get_detailed_hint(query_request: QueryRequest):
            result = query_pinecone(query_request.word)
            if not result['matches']:
                return JSONResponse(content={"message": f"No matches found for '{query_request.word}'"}, status_code=404)

            match = result['matches'][0]['metadata']
            prompt = PromptTemplate(
                input_variables=["word", "definition", "example"],
                template="""
        You are an assistant generating detailed hints for students.
        Instructions:
        1. Avoid using the word.
        2. Explain clearly and concisely.

        Word: {word}
        Definition: {definition}
        Example: {example}

        Output: Hint
        """
            )
            response = generate_response(prompt, {
                "word": match['word'],
                "definition": match['definition'],
                "example": match['example']
            })
            return JSONResponse(content={"Hint": response.strip()})

# Agent: Word Explanation Generator
@router.post("/wordexplanation/")
async def explain_word(query_request: ExplainRequest):
    result = query_pinecone(query_request.word)
    if not result['matches']:
        return JSONResponse(content={"message": f"No matches found for '{query_request.word}'"}, status_code=404)

    metadata = result['matches'][0]['metadata']
    prompt = PromptTemplate(
        input_variables=["definition", "related_Words", "preferences", "level"],
        template="""
You are an English tutor. Explain the word to a student based on their level and interests.

Definition: {definition}
Related Words: {related_Words}
Student Preferences: {preferences}
Student Level: {level}

Provide a JSON with a field 'personalized_explanation' explaining the word in a student-friendly way.
"""
    )
    response = generate_response(prompt, {
        "definition": metadata['definition'],
        "related_Words": metadata.get('related Words', ''),
        "preferences": query_request.preferences,
        "level": query_request.level
    })
    return JSONResponse(content=json.loads(response))

# Agent: Word Association Game Generator
@router.post("/associationGame/")
async def association_game(query_request: QueryRequest):
    result = query_pinecone(query_request.word)
    if not result['matches']:
        return JSONResponse(content={"message": f"No matches found for '{query_request.word}'"}, status_code=404)

    match = result['matches'][0]['metadata']
    prompt = PromptTemplate(
        input_variables=["word", "definition", "example"],
        template="""
Design a word association game using:
Word: {word}
Definition: {definition}
Example: {example}

Return JSON:
{{
"question": ..., "option1": ..., "option2": ..., "option3": ..., "option4": ..., "correct_answer": ..., "explanation": ...
}}
"""
    )
    response = generate_response(prompt, {
        "word": match['word'],
        "definition": match['definition'],
        "example": match['example']
    })
    return JSONResponse(content=json.loads(response))

# Agent: Fill in the Blank Generator
@router.post("/fillintheblank/")
async def fill_in_the_blank(query_request: ExplainRequest):
    result = query_pinecone(query_request.word)
    if not result['matches']:
        return JSONResponse(content={"message": f"No matches found for '{query_request.word}'"}, status_code=404)

    metadata = result['matches'][0]['metadata']
    prompt = PromptTemplate(
        input_variables=["word", "definition", "example", "preferences", "level"],
        template="""
You are an expert in vocabulary. Create a fill-in-the-blank question.

Word: {word}
Definition: {definition}
Example: {example}
Preferences: {preferences}
Level: {level}

Return JSON:
{{
"question": ..., "option1": ..., "option2": ..., "option3": ..., "option4": ..., "correct_answer": ..., "explanation": ...
}}
"""
    )
    response = generate_response(prompt, {
        "word": metadata['word'],
        "definition": metadata['definition'],
        "example": metadata['example'],
        "preferences": query_request.preferences,
        "level": query_request.level
    })
    return JSONResponse(content=json.loads(response))

# Agent: Multiple Fill in the Blank Generator
@router.post("/fillintheblankten/")
async def fill_in_the_blank_ten(query_request: McqQueryRequest):
    # Replace this stub with full logic if Pinecone includes a word list feature.
    # For now, simulate using one repeated prompt (this could be refactored into a utility).
    dummy_words = ["run", "jump", "build", "fly", "read", "write", "code", "sing", "draw", "laugh"]
    responses = []
    for word in dummy_words:
        result = query_pinecone(word)
        if not result['matches']:
            continue
        metadata = result['matches'][0]['metadata']
        prompt = PromptTemplate(
            input_variables=["word", "definition", "example", "preferences", "level"],
            template="""
Create a fill-in-the-blank MCQ for the given word based on student's level and interests.

Word: {word}
Definition: {definition}
Example: {example}
Preferences: {preferences}
Level: {level}

Return as JSON with: question, options 1-4, correct_answer, explanation
"""
        )
        response = generate_response(prompt, {
            "word": metadata['word'],
            "definition": metadata['definition'],
            "example": metadata['example'],
            "preferences": query_request.preferences,
            "level": query_request.level
        })
        responses.append(json.loads(response))

    return JSONResponse(content=responses)

# Agent: Ten Word MCQ Association Game
@router.post("/TenmcqA/")
async def ten_mcq_association(query_request: McqQueryRequest):
    dummy_words = ["fast", "slow", "bright", "dark", "open", "close", "hot", "cold", "happy", "sad"]
    games = []
    for word in dummy_words:
        result = query_pinecone(word)
        if not result['matches']:
            continue
        metadata = result['matches'][0]['metadata']
        prompt = PromptTemplate(
            input_variables=["word", "definition", "example", "preferences"],
            template="""
Design a word association MCQ game.

Word: {word}
Definition: {definition}
Example: {example}
Preferences: {preferences}

Return JSON with: question, 4 options, correct_answer, explanation
"""
        )
        response = generate_response(prompt, {
            "word": metadata['word'],
            "definition": metadata['definition'],
            "example": metadata['example'],
            "preferences": query_request.preferences
        })
        games.append(json.loads(response))

    return JSONResponse(content=games)

# Agent: Related Word MCQs
@router.post("/relatedmcq/")
async def related_mcq(query_request: TenMcq):
    dummy_words = ["drive", "park", "swim", "ride", "eat", "cook", "paint", "watch", "type", "talk"]
    games = []
    for word in dummy_words:
        result = query_pinecone(word)
        if not result['matches']:
            continue
        metadata = result['matches'][0]['metadata']
        prompt = PromptTemplate(
            input_variables=["word", "definition", "example", "related_Words", "synonyms", "antonyms", "preferences"],
            template="""
Create a related-word MCQ question.

Word: {word}
Definition: {definition}
Example: {example}
Related Words: {related_Words}
Synonyms: {synonyms}
Antonyms: {antonyms}
Preferences: {preferences}

Return JSON: question, 4 options, correct_answer, explanation
"""
        )
        response = generate_response(prompt, {
            "word": metadata['word'],
            "definition": metadata['definition'],
            "example": metadata['example'],
            "related_Words": metadata.get("related Words", ""),
            "synonyms": metadata.get("synonyms", ""),
            "antonyms": metadata.get("antonyms", ""),
            "preferences": query_request.preferences
        })
        games.append(json.loads(response))

    return JSONResponse(content=games)
