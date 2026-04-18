from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import uuid

# Import our components
from rag_pipeline import RAGPipeline
from database import get_db, SearchLog, Feedback
from sqlalchemy.orm import Session

app = FastAPI(title="Amazon FAQ RAG API")

# Setup CORS for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set this to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Pipeline on startup
pipeline = RAGPipeline()
pipeline.load_dataset()

# --- Pydantic Models for Validation ---
class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3

class FeedbackRequest(BaseModel):
    log_id: int
    is_helpful: bool # True=👍, False=👎
    comment: Optional[str] = None

class Source(BaseModel):
    id: str
    title: str
    content: str
    product: str
    relevance_score: float

class SearchResponse(BaseModel):
    log_id: int # Unique ID to link feedback
    answer: str
    sources: List[Source]
    processing_time_ms: int

# --- API Endpoints ---

@app.get("/health")
def health_check():
    """System health check"""
    return {"status": "ok", "docs_indexed": pipeline.document_count}

@app.post("/api/search", response_model=SearchResponse)
async def search_faqs(request: SearchRequest, db: Session = Depends(get_db)):
    """Primary search endpoint (RAG)"""
    start_time = time.time()
    
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    try:
        # 1. Run the RAG search
        answer, sources = pipeline.search(query, top_k=request.top_k)
        
        # 2. Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # 3. Log query to DB (Admin Insights)
        log_entry = SearchLog(
            query=query,
            answer_generated=answer,
            sources_used=str([s['id'] for s in sources]), # Simplified source list
            confidence_score=90, # Dummy confidence for now
            processing_time_ms=processing_time_ms
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        
        # 4. Return response (Next.js consumes this)
        return SearchResponse(
            log_id=log_entry.id,
            answer=answer,
            sources=[Source(**s) for s in sources],
            processing_time_ms=processing_time_ms
        )
        
    except Exception as e:
        print(f"Error during search: {e}")
        raise HTTPException(status_code=500, detail="Internal search error.")

@app.post("/api/feedback")
async def collect_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    """Feedback endpoint (collects 👍/👎)"""
    
    # 1. Validate log entry exists
    log_exists = db.query(SearchLog).filter(SearchLog.id == request.log_id).first()
    if not log_exists:
        raise HTTPException(status_code=404, detail="Original search log not found.")
        
    try:
        # 2. Store feedback in DB
        feedback_entry = Feedback(
            log_id=request.log_id,
            is_helpful=request.is_helpful,
            comment=request.comment
        )
        db.add(feedback_entry)
        db.commit()
        
        return {"status": "success", "message": "Feedback received. System updated."}
        
    except Exception as e:
        print(f"Error collecting feedback: {e}")
        raise HTTPException(status_code=500, detail="Error storing feedback.")

if __name__ == "__main__":
    import uvicorn
    # Local run on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
