from utils.llm import langchainLlm


async def rewrite_query_service(context: str, question: str):
    prompt = f"""
You are an expert query rewriter for a Retrieval-Augmented Generation (RAG) system.

Your task is to rewrite the user's question so it retrieves the most relevant documents from a vector database.

Rules:
1. Preserve the original intent exactly. Do NOT change what the user is asking.
2. Expand ambiguous words into more specific technical terms when appropriate.
3. Replace pronouns like "it", "this", "they", etc., with explicit entities if they can be inferred from the question.
4. Include important synonyms or related terminology that may appear in documents.
5. Keep the rewritten query concise (one sentence).
6. Do NOT answer the question.
7. Do NOT add information that is not implied by the user's question.
8. Return ONLY the rewritten query.

Context:
{context}

User Question:
{question}
"""
    response = await langchainLlm.ainvoke(prompt)
    return response.content
