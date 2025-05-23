from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Pinecone
from app.config import Index

# Setup embeddings and vector store globally 
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = Pinecone(Index, embedding_model, "word") 

# Reusable function to search by query(Student Preferences) and CEFR level
def search_vocabulary(query: str, level: str = None, k: int = 1):
    """
    Search for vocabulary terms in the vectorstore by query and level.
    
    Parameters:
        query (str): The search string (e.g., "firewall" or "technology").
        level (str): CEFR level to filter (e.g., "A1", "B1").
        k (int): Number of top documents to return.
    
    Returns:
        List[Document]: Matching LangChain Document objects with metadata.
    """
    filter_dict = {"level": level} if level else None
    
    results = vectorstore.similarity_search(
        query=query,
        k=k,
        filter=filter_dict
    )
    
    return results

results = search_vocabulary(query="cybersecurity", level="B1", k=1)

for doc in results:
    print(doc.metadata["word"])
    print(doc.metadata["definition"])
    print(doc.metadata["example"])






PromptTemplate(
    input_variables=["word", "definition", "example"],
    template="""
    You are an intelligent assistant that generates short and concise hints to help students understand and guess words.

    Your task is to create a hint based on the given word, its definition, and an example sentence. Do not include the word itself in the hint.

    Word: {word}
    Definition: {definition}
    Example: {example}
    """
)




PromptTemplate(
    input_variables=["word", "definition", "example", "level", "preferences"],
    template="""
    You are an English vocabulary assistant. Explain the word '{word}' to a student at level {level} who is interested in {preferences}.

    Definition: {definition}
    Example: {example}

    Provide a simple, clear, and personalized explanation.
    """
    )




PromptTemplate(
    
    input_variables=["word", "definition", "example", "level", "preferences"],
    template="""
You are an English vocabulary expert helping design a word association game for a student at CEFR level {level} who is interested in {preferences}.

1. Provide three related words (including '{word}').
2. Give four answer options.
3. Indicate which option is correct.
4. Explain why that option fits best in a context aligned with the student's interests.

Word: {word}
Definition: {definition}
Example: {example}

Return JSON:
{
  "question": "...",
  "option1": "...",
  "option2": "...",
  "option3": "...",
  "option4": "...",
  "correct_answer": "...",
  "explanation": "..."
}
"""
)







PromptTemplate(
    input_variables=["word", "definition", "example", "level", "preferences"],
    template="""
You are an English tutor. Generate a fill-in-the-blank question for level {level} with a preference in {preferences}.

Word: {word}
Definition: {definition}
Example: {example}

Return JSON:
{
  "question": "... [____] ...",
  "option1": "...",
  "option2": "...",
  "option3": "...",
  "option4": "...",
  "correct_answer": "...",
  "explanation": "..."
}
"""
)




llm_chain = LLMChain(llm=llm, prompt=prompt)

# Run the chain using data from Pinecone retrieval
response = llm_chain.run({
    "word":Word,
    "definition": Definition,
    "example": Example,
    "level": Level,
    "preferences": Preferences
})