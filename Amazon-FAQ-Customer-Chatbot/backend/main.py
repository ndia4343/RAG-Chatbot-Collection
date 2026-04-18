from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time

# Import components
from rag_pipeline import AmazonRAG
from database import get_db, SearchLog, Feedback
from sqlalchemy.orm import Session

app = FastAPI(title="Amazon FAQ RAG API")

# -----------------------------
# CORS (Needed for Vercel Frontend)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Initialize RAG Engine
# -----------------------------
engine = AmazonRAG()


@app.on_event("startup")
def startup_event():
    print("🔍 Loading RAG dataset...")
    engine.load_dataset()
    print(f"✅ Dataset loaded with {len(engine.data)} entries")


# -----------------------------
# Request / Response Models
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
# Health Check
# -----------------------------
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "docs_indexed": len(engine.data)
    }


# -----------------------------
# Search Endpoint (Main RAG)
# -----------------------------
@app.post("/api/search", response_model=SearchResponse)
def search_faqs(request: SearchRequest, db: Session = Depends(get_db)):

    start_time = time.time()

    query = request.query.strip()

    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

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
# Feedback Endpoint
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
# Local Run
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
