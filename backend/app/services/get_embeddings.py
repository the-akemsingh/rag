from utils.llm import langchainEmbeddings

class EmbeddingResult:
    def __init__(self, values: list[float]):
        self.values = values


async def getEmbeddings(content: list[str]):
    if not content:
        return []
    
    vectors = await langchainEmbeddings.aembed_documents(content)
    return [EmbeddingResult(v) for v in vectors]
