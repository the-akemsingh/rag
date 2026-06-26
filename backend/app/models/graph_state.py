from typing import NotRequired
from typing_extensions import TypedDict


class Metadata(TypedDict):
    # page_label: str    #not every doc type has these fields - that's what i noticed in chromadb - I COULD BE WRONG
    # page: int
    # total_pages: int
    source: str


class Doc(TypedDict):
    content: str
    score: float
    metadata: Metadata


class GraphState(TypedDict):
    user_query: str
    retrieval_query: NotRequired[str]
    document_ids: list[str]
    chat_history: NotRequired[list[dict[str, str]]]
    query_vector: NotRequired[list[float]]
    retrieved_docs: NotRequired[list[Doc]]
    relevant_docs: NotRequired[list[Doc]]
    llmResponse: NotRequired[str]
    retrieval_attempts: NotRequired[int]
    rewrite_query_attempts: NotRequired[int]
    confidence: NotRequired[float]
    clarification_needed: NotRequired[bool]
    clarification_question: NotRequired[str]