from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time

from rag_pipeline import AmazonRAG
from database import get_db, SearchLog, Feedback
from sqlalchemy.orm import Session

# -----------------------------
# APP INIT
# -----------------------------
app = FastAPI(title="Amazon FAQ RAG API")

# -----------------------------
# CORS (Frontend support)
# -----------------------------

# List only your trusted frontend URLs
origins = [
    "http://localhost:3000",          # Local development
    "http://127.0.0.1:3000",        # Alternative local
    "https://your-vercel-app.vercel.app", # Replace with your REAL deployment URL later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Still allows GET, POST, etc.
    allow_headers=["*"], # Still allows all headers
)

# -----------------------------
# RAG ENGINE
# -----------------------------
engine = AmazonRAG()


# -----------------------------
# STARTUP EVENT
# -----------------------------
@app.on_event("startup")
def startup_event():
    try:
        print("🔍 Loading RAG dataset...")
        engine.load_dataset()
        print(f"✅ Dataset loaded with {len(engine.data)} entries")
    except Exception as e:
        print(f"❌ Startup error: {e}")
        engine.data = []


# -----------------------------
# MODELS
# -----------------------------
class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3


class FeedbackRequest(BaseModel):
    log_id: int
    is_helpful: bool
    comment: Optional[str] = None


class Source(BaseModel):
    id: str
    title: str
    short_answer: str
    answer: str
    relevance: float


class SearchResponse(BaseModel):
    log_id: int
    answer: str
    sources: List[Source]
    processing_time_ms: int


# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "docs_indexed": len(engine.data) if engine.data else 0
    }


# -----------------------------
# SEARCH ENDPOINT (RAG CORE)
# -----------------------------
@app.post("/api/search", response_model=SearchResponse)
def search_faqs(request: SearchRequest, db: Session = Depends(get_db)):

    start_time = time.time()

    query = request.query.strip()

    # ✅ FIXED: proper placement
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    if engine.data is None or len(engine.data) == 0:
        raise HTTPException(status_code=500, detail="Dataset not loaded")

    try:
        # Run RAG search
        answer, sources = engine.search(query, top_k=request.top_k)

        processing_time_ms = int((time.time() - start_time) * 1000)

        # Log search
        log_entry = SearchLog(
            query=query,
            answer_generated=answer,
            sources_used=str([s["id"] for s in sources]),
            confidence_score=90,
            processing_time_ms=processing_time_ms
        )

        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)

        return SearchResponse(
            log_id=log_entry.id,
            answer=answer,
            sources=[Source(**s) for s in sources],
            processing_time_ms=processing_time_ms
        )

    except Exception as e:
        print("Search error:", e)
        raise HTTPException(status_code=500, detail="Internal search error")


# -----------------------------
# FEEDBACK ENDPOINT
# -----------------------------
@app.post("/api/feedback")
def collect_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):

    log_entry = db.query(SearchLog).filter(SearchLog.id == request.log_id).first()

    if not log_entry:
        raise HTTPException(status_code=404, detail="Search log not found")

    try:
        feedback = Feedback(
            log_id=request.log_id,
            is_helpful=request.is_helpful,
            comment=request.comment
        )

        db.add(feedback)
        db.commit()

        return {
            "status": "success",
            "message": "Feedback stored"
        }

    except Exception as e:
        print("Feedback error:", e)
        raise HTTPException(status_code=500, detail="Error storing feedback")


# -----------------------------
# LOCAL RUN
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
