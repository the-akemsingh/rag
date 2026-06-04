from google import genai
from dotenv import load_dotenv
import os
load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def getChatResponse(userInput:str):
    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=userInput
    )
    return response

def getEmbeddings(content:list[str]):
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=content
    )
    return response.embeddings


async def generateAnswer(context: str, question: str):

    prompt = f"""
You are an RAG application.

Answer the question using ONLY the provided context.

If the answer is not present in the context, say:
"Sorry, I don't know the answer."

Context:
{context}

Question:
{question}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt
    )

    return response.text