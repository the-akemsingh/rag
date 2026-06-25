GRADER_TEMPLATE = """You are a grader assessing relevance of a list of retrieved documents to a user question.

Here are the retrieved documents, separated by " ================================ ":
================================
{content}
================================

Here is the user question:
{question}

Determine which of the retrieved documents contain information that would help answer the user's question.
A document is relevant if it contains information that could help answer any part of the user's question.
Do not require exact keyword matches.
Consider semantic meaning.
It does not need to be a stringent test. The goal is to filter out erroneous retrievals.

Respond with valid JSON :
{{"relevant_indexes": [0, 2]}}
OR 
If none of the documents are relevant, return exactly:{{"relevant_indexes": []}}
Do not include any other text, explanation, or markdown formatting in your response."""