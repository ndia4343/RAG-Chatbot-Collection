from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import shutil

from backend.database import SearchLog, Feedback, get_db
from rag_pipeline import AmazonRAG

# -----------------------------
# APP INIT
# -----------------------------
app = FastAPI(title="AmzRAG Backend", version="1.0")

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# RAG ENGINE INIT
# -----------------------------
engine = AmazonRAG()

# Ensure dataset folder exists
DATASET_PATH = "dataset"
os.makedirs(DATASET_PATH, exist_ok=True)

# -----------------------------
# SETTINGS (SaaS Controls)
# -----------------------------
settings = {
    "model": "mistral-7b",
    "temperature": 0.7,
    "top_k": 5,
    "confidence": 0.6
}

# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/")
def health():
    return {
        "status": "online",
        "engine": "ready"
    }


# -----------------------------
# QUERY ENDPOINT
# -----------------------------
@app.post("/query")
async def query_bot(request: dict, db: Session = Depends(get_db)):

    question = request.get("question")

    if not question or not question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty"
        )

    try:

        output = engine.search(question)

        answer = output.get("answer", "No answer found.")
        confidence = output.get("confidence", 0.0)
        sources = output.get("sources", [])

        # Save search log
        log = SearchLog(
            query=question,
            answer_generated=answer,
            sources_used=",".join(sources) if sources else ""
        )

        db.add(log)
        db.commit()
        db.refresh(log)

        return {
            "answer": answer,
            "confidence": confidence,
            "sources": sources,
            "log_id": log.id
        }

    except Exception as e:
        print(f"QUERY ERROR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="AI processing failed"
        )


# -----------------------------
# FILE UPLOAD + INDEX
# -----------------------------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    allowed = ["pdf", "txt", "docx", "csv", "md"]

    ext = file.filename.split(".")[-1].lower()

    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail="File type not supported"
        )

    try:

        filename = os.path.basename(file.filename)
        file_path = os.path.join(DATASET_PATH, filename)

        # Prevent duplicate uploads
        if os.path.exists(file_path):
            raise HTTPException(
                status_code=400,
                detail="File already exists"
            )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Add file to RAG index
        engine.add_file(file_path)

        return {
            "status": "success",
            "filename": filename,
            "message": "File uploaded & indexed"
        }

    except Exception as e:
        print(f"UPLOAD ERROR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Upload failed"
        )


# -----------------------------
# LIST KNOWLEDGE FILES
# -----------------------------
@app.get("/list-files")
async def list_files():

    files = []

    if os.path.exists(DATASET_PATH):

        for f in os.listdir(DATASET_PATH):

            full_path = os.path.join(DATASET_PATH, f)

            size = round(os.path.getsize(full_path) / 1024, 1)

            files.append({
                "name": f,
                "size": f"{size} KB"
            })

    return files


# -----------------------------
# DELETE FILE
# -----------------------------
@app.delete("/delete-file/{filename}")
async def delete_file(filename: str):

    file_path = os.path.join(DATASET_PATH, filename)

    if os.path.exists(file_path):

        os.remove(file_path)

        # Reload vector index safely
        engine.load_persisted()

        return {"message": "deleted"}

    raise HTTPException(
        status_code=404,
        detail="File not found"
    )


# -----------------------------
# FEEDBACK SYSTEM
# -----------------------------
@app.post("/feedback")
def submit_feedback(data: dict, db: Session = Depends(get_db)):

    log_id = data.get("log_id")
    helpful = data.get("helpful")
    comment = data.get("comment", "")

    if log_id is None:
        raise HTTPException(
            status_code=400,
            detail="log_id required"
        )

    # Validate log exists
    log = db.query(SearchLog).filter(
        SearchLog.id == log_id
    ).first()

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Search log not found"
        )

    feedback = Feedback(
        log_id=log_id,
        is_helpful=helpful,
        comment=comment
    )

    db.add(feedback)
    db.commit()

    return {"status": "feedback recorded"}


# -----------------------------
# ANALYTICS STATS
# -----------------------------
@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):

    total_logs = db.query(func.count(SearchLog.id)).scalar() or 0

    helpful = db.query(func.count(Feedback.id)).filter(
        Feedback.is_helpful == True
    ).scalar() or 0

    total_feedback = db.query(func.count(Feedback.id)).scalar() or 0

    if total_feedback == 0:
        helpful_rate = "0%"
    else:
        helpful_rate = f"{round((helpful / total_feedback) * 100, 1)}%"

    return {
        "total_logs": total_logs,
        "helpful_rate": helpful_rate
    }


# -----------------------------
# SETTINGS API
# -----------------------------
@app.get("/settings")
def get_settings():
    return settings


@app.post("/settings")
def update_settings(data: dict):

    settings.update(data)

    return {
        "status": "updated",
        "settings": settings
    }
