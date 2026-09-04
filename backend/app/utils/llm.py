import os

from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from pydantic import SecretStr

# from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not set")

langchainLlm = ChatGroq(
    model="qwen/qwen3.8-27b", 
    api_key=SecretStr(GROQ_API_KEY)
)

# langchainEmbeddings = HuggingFaceEmbeddings(
#     model_name="sentence-transformers/all-MiniLM-L6-v2"
# )

langchainEmbeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-2",
    api_key=SecretStr(GEMINI_API_KEY)
)