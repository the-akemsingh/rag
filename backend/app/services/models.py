from pydantic import BaseModel

class Embedded_Data(BaseModel):
    document_id:str
    chunk_id:str
    text:str
    embeddings:list[float]
    metadata:  dict[str, str | int]