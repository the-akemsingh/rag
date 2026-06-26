import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from pydantic import SecretStr

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set")

# LangChain LLM Client
langchainLlm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    api_key=SecretStr(GEMINI_API_KEY)
)

# LangChain Embeddings Client
langchainEmbeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-2",
    api_key=SecretStr(GEMINI_API_KEY)
)