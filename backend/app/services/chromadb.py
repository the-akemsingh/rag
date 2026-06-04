import chromadb
import os
from dotenv import load_dotenv
load_dotenv()
from services.models import Embedded_Data
from chromadb import Search, K, Knn

client = chromadb.CloudClient(
  api_key=os.getenv("CHROMA_API_KEY"),
  tenant=os.getenv("CHROMA_TENANT"),
  database=os.getenv("CHROMA_DATABASE")
)



def getCollection():
    collection = client.get_or_create_collection(name="document_embeddings",embedding_function=None)
    return collection

def addEmbeddingDataToCollection(embeddingsData :list[Embedded_Data]) -> bool:
    batch_size = 100
    for item in range(0, len(embeddingsData),batch_size):
        batch = embeddingsData[item:item + batch_size]
        collection = getCollection()
        collection.add(
            ids=[chunk.chunk_id for chunk in batch],
            embeddings=[chunk.embeddings for chunk in batch],
            documents=[chunk.text for chunk in batch],
            metadatas=[chunk.metadata for chunk in batch]
        )
    return True





def search_embeddings(vector:list[float]):
    search = (
        Search()
        # .where((K("category") == "science") & (K("year") >= 2020))
        .limit(5)
        .select(K.DOCUMENT, K.SCORE)
    )
    collection = getCollection()
    result = collection.search(search.rank(Knn(query=vector)))
    return result