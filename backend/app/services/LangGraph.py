from services.get_embeddings import getEmbeddings
from services.generate_answer import generateAnswer
from services.chromadb import search_embeddings
from services.rewrite_query import rewrite_query_service
from services.GRADER_TEMPLATE import GRADER_TEMPLATE

from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph
from langgraph.graph import START, END

from pydantic import BaseModel
from typing import cast
from models.graph_state import GraphState

from utils.llm import langchainLlm


class GraderOutput(BaseModel):
    relevant_indexes: list[int]


grade_prompt = ChatPromptTemplate.from_template(GRADER_TEMPLATE)
structured_llm = langchainLlm.with_structured_output(GraderOutput)
docGrader = grade_prompt | structured_llm


# graph nodes
async def embed_user_query(state: GraphState):
    embeddings = await getEmbeddings([get_retrieval_query(state)])

    if not embeddings or not embeddings[0].values:
        return {"query_vector": []}

    return {"query_vector": embeddings[0].values}


async def retrieve(state: GraphState):
    query_vector = state.get("query_vector")
    if not query_vector:
        return {"retrieved_docs": []}

    search_result = await search_embeddings(query_vector, state["document_ids"])

    if not search_result["documents"] or not search_result["documents"][0]:
        return {"retrieved_docs": []}

    retrieved_docs = search_result["documents"][0]
    retrieved_docs_score = search_result["scores"][0]
    retrieved_docs_metadata = search_result["metadatas"][0]

    return {
        "retrieved_docs": [
            {"content": doc, "score": score, "metadata": metadata}
            for doc, score, metadata in zip(
                retrieved_docs, retrieved_docs_score, retrieved_docs_metadata
            )
        ]
    }


async def document_grader(state: GraphState):
    retrieved_docs = state.get("retrieved_docs")
    if not retrieved_docs:
        return {"relevant_docs": []}

    relevantDocs = []
    context_parts = []

    for idx, doc in enumerate(retrieved_docs):
        context_parts.append(
            f"""
            Document Index: {idx},\n 
            Document Content: {doc["content"]}
            """
        )

    context = "\n ================================ \n".join(context_parts)

    graderReponse = cast(
        GraderOutput,
        await docGrader.ainvoke(
            {"question": get_retrieval_query(state), "content": context}
        ),
    )

    if graderReponse.relevant_indexes:
        for index in graderReponse.relevant_indexes:
            idx = int(index)
            if 0 <= idx < len(retrieved_docs):
                relevantDocs.append(retrieved_docs[idx])

    return {"relevant_docs": relevantDocs}


async def generate_llm_response(state: GraphState):
    relevant_docs = state.get("relevant_docs")

    if not relevant_docs:
        return {
            "llmResponse": "Sorry, I don't have enough information in the provided documents to answer that question."
        }

    history_context = get_chat_history_context(state)
    documents_context = "\n\n\n".join(
        [
            f"""Content:\n {doc["content"]} \n\n Metdata:\n Source: {doc["metadata"]["source"]}"""
            for doc in relevant_docs
        ]
    )

    context = f"Conversation History:\n{history_context}\n\nRelevant Documents:\n{documents_context} "

    answer = await generateAnswer(context, state["user_query"])
    return {"llmResponse": answer}


#  conditional edge node
def route_after_grading(state: GraphState):
    relevant_docs = state.get("relevant_docs")
    if relevant_docs:
        return "generate_llm_response"

    if state.get("rewrite_query_attempts", 0) >= 1:
        return "no_answer"

    return "rewrite_query"


def no_answer(state: GraphState):
    return {
        "llmResponse": "Sorry, I don't have enough information in the provided documents to answer that question."
    }


async def rewrite_query(state: GraphState):
    current_attempts = state.get("rewrite_query_attempts") or 0

    history_context = get_chat_history_context(state)

    context = f"Conversation History:\n{history_context}"

    answer = await rewrite_query_service(context, state["user_query"])

    return {
        "retrieval_query": answer,
        "rewrite_query_attempts": current_attempts + 1,
        # "query_vector": [],
        # "retrieved_docs": [],
        # "relevant_docs": [],
    }


#  workflow
agent_builder = StateGraph(GraphState)

agent_builder.add_edge(START, "embed_user_query")
agent_builder.add_node("embed_user_query", embed_user_query)
agent_builder.add_node("retrieve", retrieve)
agent_builder.add_node("document_grader", document_grader)
agent_builder.add_node("generate_llm_response", generate_llm_response)
agent_builder.add_node("rewrite_query", rewrite_query)
agent_builder.add_node("no_answer", no_answer)


agent_builder.add_edge(start_key="embed_user_query", end_key="retrieve")
agent_builder.add_edge(start_key="retrieve", end_key="document_grader")

agent_builder.add_conditional_edges(
    "document_grader",
    route_after_grading,
    {
        "generate_llm_response": "generate_llm_response",
        "rewrite_query": "rewrite_query",
        "no_answer": "no_answer",
    },
)

agent_builder.add_edge(start_key="rewrite_query", end_key="embed_user_query")
agent_builder.add_edge("generate_llm_response", END)
agent_builder.add_edge("no_answer", END)


agent = agent_builder.compile()


# helper functions
def get_retrieval_query(state: GraphState) -> str:
    return state.get("retrieval_query") or state["user_query"]


def get_chat_history_context(state):
    chat_history = state.get("chat_history", [])
    history_lines = []

    for item in chat_history:
        role = item.get("role", "unknown")
        if role == "document":
            document_name = item.get("document_name", item.get("content", ""))
            history_lines.append(f"document: {document_name}")
        else:
            history_lines.append(f"{role}: {item.get('content', '')}")

    history_context = "\n".join(history_lines)
    return history_context
