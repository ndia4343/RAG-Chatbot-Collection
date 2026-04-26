from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import shutil

from .database import SearchLog, Feedback, get_db, init_db
from .rag_pipeline import AmazonRAG


app = FastAPI(title="AmzRAG Backend", version="1.0")


# ------------------------------------------------
# Startup
# ------------------------------------------------

@app.on_event("startup")
def startup():
    init_db()


# ------------------------------------------------
# CORS
# ------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------
# RAG ENGINE
# ------------------------------------------------

engine = AmazonRAG()

DATASET_PATH = os.path.abspath("dataset")
os.makedirs(DATASET_PATH, exist_ok=True)


settings = {
    "model": "mistral-7b",
    "temperature": 0.7,
    "top_k": 5,
    "confidence": 0.6
}


# ------------------------------------------------
# HEALTH
# ------------------------------------------------

@app.get("/")
def health():
    return {"status": "online", "engine": "ready"}


# ------------------------------------------------
# QUERY
# ------------------------------------------------

@app.post("/query")
async def query_bot(request: dict, db: Session = Depends(get_db)):

    question = request.get("question")

    if not question:
        raise HTTPException(400, "Question cannot be empty")

    try:

        output = engine.search(question)

        answer = output["answer"]
        confidence = output["confidence"]
        sources = output["sources"]

        log = SearchLog(
            query=question,
            answer_generated=answer,
            sources_used=sources
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
        print("QUERY ERROR:", e)
        raise HTTPException(500, "AI processing failed")


# ------------------------------------------------
# UPLOAD FILE
# ------------------------------------------------

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    allowed = ["pdf", "txt", "docx", "csv", "md"]

    ext = file.filename.split(".")[-1].lower()

    if ext not in allowed:
        raise HTTPException(400, "File type not supported")

    filename = os.path.basename(file.filename)
    path = os.path.join(DATASET_PATH, filename)

    if os.path.exists(path):
        raise HTTPException(400, "File already exists")

    try:

        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        engine.add_file(path)

        return {
            "status": "success",
            "filename": filename
        }

    except Exception as e:
        print("UPLOAD ERROR:", e)
        raise HTTPException(500, "Upload failed")


# ------------------------------------------------
# LIST FILES
# ------------------------------------------------

@app.get("/list-files")
def list_files():

    files = []

    if os.path.exists(DATASET_PATH):

        for f in os.listdir(DATASET_PATH):

            path = os.path.join(DATASET_PATH, f)

            size = round(os.path.getsize(path) / 1024, 1)

            files.append({
                "name": f,
                "size": f"{size} KB"
            })

    return files


# ------------------------------------------------
# DELETE FILE
# ------------------------------------------------

@app.delete("/delete-file/{filename}")
def delete_file(filename: str):

    path = os.path.join(DATASET_PATH, filename)

    if not os.path.exists(path):
        raise HTTPException(404, "File not found")

    os.remove(path)

    engine.load_persisted()

    return {"message": "deleted"}


# ------------------------------------------------
# FEEDBACK
# ------------------------------------------------

@app.post("/feedback")
def feedback(data: dict, db: Session = Depends(get_db)):

    log_id = data.get("log_id")
    rating = data.get("rating")
    comment = data.get("comment")

    log = db.query(SearchLog).filter(SearchLog.id == log_id).first()

    if not log:
        raise HTTPException(404, "Log not found")

    fb = Feedback(
        log_id=log_id,
        rating=rating,
        comment=comment
    )

    db.add(fb)
    db.commit()

    return {"status": "recorded"}


# ------------------------------------------------
# STATS
# ------------------------------------------------

@app.get("/api/stats")
def stats(db: Session = Depends(get_db)):

    total_logs = db.query(func.count(SearchLog.id)).scalar() or 0

    total_feedback = db.query(func.count(Feedback.id)).scalar() or 0

    good = db.query(func.count(Feedback.id)).filter(
        Feedback.rating == 3
    ).scalar() or 0

    helpful_rate = 0

    if total_feedback:
        helpful_rate = round((good / total_feedback) * 100, 1)

    return {
        "total_logs": total_logs,
        "helpful_rate": f"{helpful_rate}%"
    }

# ------------------------------------------------
# SETTINGS
# ------------------------------------------------

@app.get("/settings")
def get_settings():
    return settings


@app.post("/settings")
def update_settings(data: dict):

    for k, v in data.items():
        if k in settings:
            settings[k] = v

    return {"settings": settings}

