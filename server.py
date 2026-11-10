from mcp.server import MCPServer
from rag_engine import (
    index_document as rag_index_document,
    query_knowledge_base,
    retriever,
)

mcp = MCPServer("Local-RAG-Engine")


@mcp.tool()
def ask_knowledge_base(question: str) -> str:
    """Answers a question using the local private knowledge base and local LLM."""
    return query_knowledge_base(question)


@mcp.tool()
def search_knowledge_base(query: str) -> str:
    """Searches the company knowledge base for internal policies, project details, product catalog, pricing, and guidelines."""
    docs = retriever.invoke(query)
    if not docs:
        return "No relevant documents found."
    return "\n\n---\n\n".join([doc.page_content for doc in docs])


@mcp.tool()
def index_document(file_path: str) -> str:
    """Indexes a local text document (.txt, .md) into the Chroma vector database."""
    return rag_index_document(file_path)


if __name__ == "__main__":
    mcp.run()
