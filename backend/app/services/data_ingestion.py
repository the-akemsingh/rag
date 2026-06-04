from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
import uuid
from services.llm_call import getEmbeddings
from services.chromadb import addEmbeddingDataToCollection
from services.models import Embedded_Data

def process_document(filepath:str):
    chunks = fileChunkHandler(filepath=filepath)
    embeddedDoc = generate_document_embeddings(chunks)
    addEmbeddingDataToCollection(embeddedDoc)
    
    return

def fileChunkHandler(filepath:str) -> list[Document] :
    loader =  PyPDFLoader(filepath)
    file = loader.load()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(file)
    return chunks
    
def generate_document_embeddings(
    chunks: list[Document]
) -> list[Embedded_Data]:

    document_id = str(uuid.uuid4())
    texts = [doc.page_content for doc in chunks]
    embeddings_response = getEmbeddings(texts)
    
    if embeddings_response is None:
        return []

    document_embeddings = []

    for index, (doc, embedding) in enumerate(
        zip(chunks, embeddings_response)
    ):

        vector = embedding.values

        if vector is None:
            continue

        document_embeddings.append(
            Embedded_Data(
                document_id=document_id,
                chunk_id=f"{document_id}_{index}",
                text=doc.page_content,
                embeddings=vector,
                metadata={
                    **doc.metadata,
                    "document_id": document_id
                }
            )
        )

    return document_embeddings