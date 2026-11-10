import os
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_ollama import ChatOllama
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

CHROMA_PATH = "./chroma_db"

embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
llm = ChatOllama(model="qwen3:4b-instruct", temperature=0)

# Initialize vector store and retriever once in memory
vector_db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
retriever = vector_db.as_retriever(search_kwargs={"k": 4})


def index_document(file_path: str) -> str:
    """Loads, splits, and adds new document (.txt, .md, .pdf) chunks into ChromaDB."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
    else:
        loader = TextLoader(file_path, encoding="utf-8")
    
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=50)
    chunks = splitter.split_documents(docs)

    valid_chunks = [c for c in chunks if c.page_content and c.page_content.strip()]
    if not valid_chunks:
        return f"Document {file_path} saved, but no extractable text chunks were found."

    vector_db.add_documents(valid_chunks)
    return f"Successfully indexed {len(valid_chunks)} chunks from {file_path}"


def query_knowledge_base(question: str) -> str:
    """Retrieves relevant chunks and generates an answer using the local LLM."""
    relevant_docs = retriever.invoke(question)
    context_text = "\n\n---\n\n".join([doc.page_content for doc in relevant_docs])

    prompt = f"""You are a helpful assistant. Answer the question using ONLY the provided context below.
If the answer is not in the context, say "I don't have information about that in the knowledge base."

Context:
{context_text}

Question: {question}
Answer:"""

    response = llm.invoke(prompt)

    if hasattr(response, "text"):
        return response.text
    return (
        response.content[0]["text"]
        if isinstance(response.content, list)
        else str(response.content)
    )
