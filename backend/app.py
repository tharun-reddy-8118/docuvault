import os
import time
import shutil
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

import rag_engine
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.tools import tool

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
os.makedirs(DOCS_DIR, exist_ok=True)

# Detect frontend/dist path whether run from root or backend directory
FRONTEND_DIST = os.path.join(BASE_DIR, "..", "frontend", "dist") if os.path.exists(os.path.join(BASE_DIR, "..", "frontend", "dist")) else os.path.join(BASE_DIR, "frontend", "dist")

# 1. Initialize FastAPI Application
app = FastAPI(title="Private Knowledge Engine API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Setup Agent with Tools & In-Memory Checkpointer
llm = ChatOllama(model="qwen3:4b-instruct", temperature=0)

last_executed_tools: List[Dict[str, Any]] = []

@tool
def search_knowledge_base(query: str) -> str:
    """Searches the company knowledge base for internal policies, project details, product catalog, pricing, and uploaded files."""
    global last_executed_tools
    docs = rag_engine.retriever.invoke(query)
    last_executed_tools.append({
        "name": "search_knowledge_base",
        "query": query,
        "chunks_found": len(docs),
        "chunks": [d.page_content for d in docs]
    })
    if not docs:
        return "No relevant documents found."
    return "\n\n---\n\n".join([doc.page_content for doc in docs])

@tool
def index_document(file_path: str) -> str:
    """Indexes a local text or PDF document into the Chroma vector database."""
    global last_executed_tools
    res = rag_engine.index_document(file_path)
    last_executed_tools.append({
        "name": "index_document",
        "file_path": file_path,
        "status": res
    })
    return res

system_prompt = (
    "You are an internal enterprise knowledge retrieval assistant with access to all private documents, vaults, and uploaded files.\n"
    "CRITICAL MANDATORY INSTRUCTIONS:\n"
    "1. You have zero internal memory. For EVERY user question, query, or topic (projects, employees, architects, pricing, specs, policies, or uploaded files), you MUST ALWAYS call the search_knowledge_base tool FIRST.\n"
    "2. Always extract key terms from the LATEST user message to query search_knowledge_base.\n"
    "3. NEVER say 'I don't have information', 'I cannot determine', or 'Please consult documentation' without executing search_knowledge_base first.\n"
    "4. When search_knowledge_base returns results, directly synthesize and state the factual answer from the retrieved chunks."
)

memory = MemorySaver()
agent = create_react_agent(
    llm,
    [search_knowledge_base, index_document],
    prompt=system_prompt,
    checkpointer=memory
)

# 3. Request & Response Schemas
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "session-1"

class ChatResponse(BaseModel):
    answer: str
    session_id: str
    tool_calls: List[Dict[str, Any]]
    latency_ms: float

class IngestRequest(BaseModel):
    file_path: str

class IngestResponse(BaseModel):
    success: bool
    message: str
    vector_count: int

# 4. API Endpoints
@app.get("/api/status")
def get_system_status():
    """Returns real operational metrics and indexed files."""
    available_files = []
    if os.path.exists(DOCS_DIR):
        for f in os.listdir(DOCS_DIR):
            full_path = os.path.join(DOCS_DIR, f)
            if os.path.isfile(full_path):
                available_files.append({
                    "name": f,
                    "path": f"docs/{f}",
                    "size_bytes": os.path.getsize(full_path),
                    "extension": os.path.splitext(f)[1].lower()
                })

    count = 0
    try:
        count = rag_engine.vector_db._collection.count()
    except Exception:
        count = 0

    return {
        "status": "operational",
        "vector_count": count,
        "available_files": available_files,
        "llm_model": "qwen3:4b-instruct (Local via Ollama)",
        "embedding_model": "models/gemini-embedding-001 (3072 dims)",
        "protocol": "Model Context Protocol compatible (FastMCP / stdio)"
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    """Processes user query through the agent with conversational memory."""
    global last_executed_tools
    last_executed_tools.clear()

    start_time = time.time()
    session_id = req.session_id or "session-1"
    config = {"configurable": {"thread_id": session_id}}

    try:
        result = await agent.ainvoke(
            {"messages": [("user", req.message)]},
            config=config
        )
        answer = result["messages"][-1].content

        # Fail-safe: if agent skipped tool calling or gave refusal on a factual query, ground via retriever
        greetings = {"hi", "hello", "hey", "greetings", "good morning", "thanks", "thank you"}
        clean_query = req.message.strip().lower()
        has_refusal = any(phrase in answer.lower() for phrase in [
            "don't have access", "don't have specific", "cannot determine", 
            "cannot find", "lack of access", "consult the relevant", "consult documentation"
        ])

        if (not last_executed_tools or has_refusal) and clean_query not in greetings:
            docs = rag_engine.retriever.invoke(req.message)
            if docs:
                fallback_answer = rag_engine.query_knowledge_base(req.message)
                if "don't have information" not in fallback_answer.lower():
                    answer = fallback_answer
                if not last_executed_tools:
                    last_executed_tools.append({
                        "name": "search_knowledge_base",
                        "query": req.message,
                        "chunks_found": len(docs),
                        "chunks": [d.page_content for d in docs]
                    })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    latency = round((time.time() - start_time) * 1000, 1)

    return ChatResponse(
        answer=answer,
        session_id=session_id,
        tool_calls=list(last_executed_tools),
        latency_ms=latency
    )

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Uploads a document to backend/docs and automatically indexes it into ChromaDB."""
    os.makedirs(DOCS_DIR, exist_ok=True)
    filename = os.path.basename(file.filename)
    dest_path = os.path.join(DOCS_DIR, filename)

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        msg = rag_engine.index_document(dest_path)
        count = rag_engine.vector_db._collection.count()

        return {
            "success": True,
            "filename": filename,
            "path": f"docs/{filename}",
            "message": msg,
            "vector_count": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process {filename}: {str(e)}")

@app.post("/api/ingest", response_model=IngestResponse)
def ingest_endpoint(req: IngestRequest):
    """Dynamically ingests a local file by path."""
    target_path = req.file_path if os.path.isabs(req.file_path) else os.path.join(BASE_DIR, req.file_path)
    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail=f"File '{req.file_path}' not found.")

    try:
        msg = rag_engine.index_document(target_path)
        count = rag_engine.vector_db._collection.count()
        return IngestResponse(
            success=True,
            message=msg,
            vector_count=count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount static assets and fallback for React SPA client-side routing
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path:
            candidate = os.path.join(FRONTEND_DIST, full_path)
            if os.path.exists(candidate) and os.path.isfile(candidate):
                return FileResponse(candidate)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
