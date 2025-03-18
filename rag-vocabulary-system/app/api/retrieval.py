import os
from fastapi import APIRouter
from langchain.chains import RetrievalQA
from langchain_pinecone import Pinecone
from pinecone import Pinecone as PineconeClient
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings

os.environ["GOOGLE_API_KEY"] = "AIzaSyDU5z69qVaIYtrBXEjRB_GZPXP4mfOIpRo"
PINECONE_API_KEY = "pcsk_2hdVRZ_K5vhsLUWQsU1Cy3ZXyjwHQVNNXfYuHjeUcZh5aFBUJBGgcMZWoP4QRtPjJb453A"
index_name = "quickstart"

router2  = APIRouter()


class StudentProfile(BaseModel):
    level: str
    preferences: list[str]

class QueryInput(BaseModel):
    query: str
    student_profile: StudentProfile

class DefinitionResponse(BaseModel):
    personalized_explanation: str

# Initialize Pinecone
pc = PineconeClient(api_key=PINECONE_API_KEY)
index = pc.Index(index_name)

# Correct LangChain embedding wrapper
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Vectorstore setup
vectorstore = Pinecone(index=index, embedding=embedding_model, text_key="text")
retriever = vectorstore.as_retriever()

# Gemini LLM
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")

# QA chain
qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)

def get_response(query: str):
    print("Hi")
    return qa_chain.run(query)



from langchain.agents import Tool
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory


## multiagent RAG

# 1. **Retrieval Agent**: Fetches word definitions and examples
def retrieval_agent(query):
    result = retriever.get_relevant_documents(query, k=1)
    return result[0].page_content if result else "No relevant information found."


retrieval_tool = Tool(
    name="RetrievalAgent",
    func=retrieval_agent,
    description="Fetches word definitions, examples, and related information."
)


# 2. **Personalization Agent**: Adjusts explanation based on student preferences and level

def personalized_explanation(q):
    

    preferences="Hindi Film"
    level="Beginner"

    # Example Query
    query = "Explain 'happy'"

    
    
    
    # Step 1: Retrieve detailed word information
    base_explanation = retrieval_agent(query)  # Get the base explanation

    # Step 2: Personalize the explanation based on student preferences and level
    #personalized_content = f"Based on your interests in {', '.join(student_profile['preferences'])} and your level: {student_profile['level']}, here is the explanation: \n\n"

    # Step 3: Create a more detailed personalized explanation
    #personalized_explanation = f"{personalized_content} {base_explanation}"

    # You can add more conditional logic here based on the level or preferences
    # if student_profile['level'] == 'Intermediate':
    #     personalized_explanation += "\n\nAt this level, it's important to focus on examples and applications. Here’s how the word 'happy' could be used in different contexts."
    personalized_explanation=f"""
            You are an expert in English vocabulary. Your task is to explain the word based on the student's preferences and level. First, retrieve the basic definition of the word and then adjust the explanation based on the student's level and their specific interests.



            1. Retrieve the basic definition of the word, including its synonyms, antonyms, and example usage.
            2. Tailor the explanation based on the student's level (e.g., Beginner, Intermediate, Advanced).
            3. Personalize the explanation based on the student's preferences 

            Given the following information:
           
            - **base_explanation**: ```{base_explanation}```
            - **Student Preferences**: ```{preferences}```
            - **Student Level**: ```{level}```

            Your response should:
            1. **Provide the basic definition** of the word.
            2. **Tailor the explanation** based on the student's level. For example:
                - For **Beginner**: Use simple language, everyday examples, and avoid complex synonyms.
                - For **Intermediate**: Provide additional context, related examples, synonyms, and antonyms where applicable.
                - For **Advanced**: Include complex examples, possible nuances in meaning, and explore various contexts in which the word could be used.
            3. **Personalize the explanation** based on the student's preferences. For example, if the student is interested in **Technology**, use relevant tech-related examples for the word's usage.

            Finally, format your response in the following JSON structure:
            ```json
            {{
                "personalized_explanation": "Your personalized explanation based on the student's level and preferences."
            }}
            ```
            """
    return personalized_explanation

personalization_tool = Tool(
    name="PersonalizedExplanationAgent",
    func=personalized_explanation,
    description="Explains word based on the student's preferences and level."
)




# # 3. **Game Generation Agent**: Creates vocabulary games like Word Fill, Word Association, and Taboo
# def generate_word_fill_game(query):
#     word = query.split()[0]
#     return f"Fill in the blank: {word[:2]}___"

# def generate_word_association_game(word, synonyms):
#     return f"Match '{word}' with the correct synonym: {', '.join(synonyms + ['random_word'])}"

# def generate_taboo_game(word, forbidden_words):
#     return f"Describe '{word}' without using: {', '.join(forbidden_words)}"

# game_generation_tool = Tool(
#     name="GameGenerationAgent",
#     func=generate_word_fill_game,
#     description="Generates vocabulary games like Word Fill, Word Association, and Taboo."
# )




# # 4. **Feedback Agent**: Provides feedback during games
# def feedback_agent(game_response, correct_answer):
#     if game_response.lower() != correct_answer.lower():
#         return "Incorrect. Here's a hint: Try thinking about the word's meaning and synonyms!"
#     return "Correct! Well done!"

# feedback_tool = Tool(
#     name="FeedbackAgent",
#     func=feedback_agent,
#     description="Provides feedback during vocabulary games."
# )


# --- Step 3: Initialize Multiagent System ---
tools = [
    retrieval_tool,
    personalization_tool
   
]

memory = ConversationBufferMemory(memory_key="chat_history")

# Initialize the agent system using Zero-Shot React Description agent type
multiagent_rag = initialize_agent(
    tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    memory=memory,
    verbose=True
)

@router2.post("/getdefinitionnew/", response_model=DefinitionResponse)
async def getdefinitionnew(inputs:QueryInput):
    

    student_profile = inputs.student_profile
    query = inputs.query

    # Get personalized explanation based on student profile
    
    formatted_query = f"{query} (Student Level: {student_profile.level}, Preferences: {', '.join(student_profile.preferences)})"

    # Get personalized explanation based on student profile
    response = multiagent_rag.invoke({"input": formatted_query})


    if response:
       return JSONResponse(response)
    else:
       return JSONResponse(content={"message": "No valid explanation generated"}, status_code=404)