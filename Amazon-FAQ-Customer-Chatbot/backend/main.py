from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil

from rag_pipeline import AmazonRAG

# -----------------------------
# APP INIT
# -----------------------------
app = FastAPI(title="AmzRAG Backend", version="1.0")

# -----------------------------
# CORS (PRODUCTION SAFE)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# RAG ENGINE INIT
# -----------------------------
engine = AmazonRAG()

# -----------------------------
# SETTINGS (SIMPLE SaaS CONTROL)
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
    return {"status": "online", "engine": "ready"}

# -----------------------------
# QUERY ENDPOINT (RAG)
# -----------------------------
@app.post("/query")
async def query_bot(request: dict):
    question = request.get("question")

    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        output = engine.search(question)

        return {
            "answer": output.get("answer", "No answer found."),
            "confidence": output.get("confidence", 0.0),
            "sources": output.get("sources", [])
        }

    except Exception as e:
        print(f"QUERY ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="AI processing failed")

# -----------------------------
# UPLOAD + INDEX FILE (FIXED)
# -----------------------------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # 1. FIXED dataset folder
        DATASET_PATH = "dataset"
        os.makedirs(DATASET_PATH, exist_ok=True)

        # 2. Save file
        file_path = os.path.join(DATASET_PATH, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 3. INDEX INTO RAG (IMPORTANT FIX)
        engine.add_file(file_path)

        return {
            "status": "success",
            "filename": file.filename,
            "message": "File uploaded & indexed"
        }

    except Exception as e:
        print(f"UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Upload failed")

# -----------------------------
# LIST FILES (KNOWLEDGE BASE)
# -----------------------------
@app.get("/list-files")
async def list_files():
    files = []
    path = "dataset"

    if os.path.exists(path):
        for f in os.listdir(path):
            full_path = os.path.join(path, f)
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
    file_path = os.path.join("dataset", filename)

    if os.path.exists(file_path):
        os.remove(file_path)

        # OPTIONAL: rebuild index safely
        engine.load_persisted()

        return {"message": "deleted"}

    raise HTTPException(status_code=404, detail="File not found")

# -----------------------------
# SETTINGS API (SAAS CONTROL)
# -----------------------------
@app.get("/settings")
def get_settings():
    return settings

@app.post("/settings")
def update_settings(data: dict):
    settings.update(data)
    return {"status": "updated", "settings": settings}
