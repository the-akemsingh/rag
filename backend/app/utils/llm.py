import os

from dotenv import load_dotenv

# 1. Update your imports to use Groq and HuggingFace
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from pydantic import SecretStr

load_dotenv()

# 2. Extract the Groq API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not set")

# LangChain LLM Client (Powered by Groq)
# We swap gemini-2.5-flash with a fast open-weights equivalent (Llama 3.3 70B)
langchainLlm = ChatGroq(
    model="qwen/qwen3.8-27b", 
    api_key=SecretStr(GROQ_API_KEY)
)

# LangChain Embeddings Client (Powered by HuggingFace)
# Swapped gemini-embedding-2 for a lightweight, industry-standard alternative
langchainEmbeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)
