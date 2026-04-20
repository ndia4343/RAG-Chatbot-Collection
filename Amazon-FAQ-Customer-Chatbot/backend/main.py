from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import pandas as pd
from rag_pipeline import AmazonRAG

app = FastAPI()

# ========================
# SETTINGS (SaaS CONFIG)
# ========================
settings = {
    "model": "mistral-7b",
    "temperature": 0.7,
    "top_k": 5,
    "confidence": 0.6
}

@app.get("/settings")
def get_settings():
    return settings

@app.post("/settings")
def update_settings(data: dict):
    settings.update(data)
    return {"status": "updated", "settings": settings}

# ========================
# CORS
# ========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with Vercel domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================
# DATASET PATH (FIXED)
# ========================
DATASET_PATH = "dataset"
os.makedirs(DATASET_PATH, exist_ok=True)

# ========================
# AI ENGINE
# ========================
engine = AmazonRAG()

# ========================
# HEALTH CHECK
# ========================
@app.get("/")
async def health_check():
    return {"status": "online", "engine": "ready"}

# ========================
# QUERY (RAG CORE)
# ========================
@app.post("/query")
async def query_bot(request: dict):
    question = request.get("question")

    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        output = engine.search(question)

        return {
            "answer": output.get("answer", "No answer found"),
            "confidence": output.get("confidence", 0.95),
            "sources": output.get("sources", [])
        }

    except Exception as e:
        print(f"❌ QUERY ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="AI processing error")

# ========================
# UPLOAD FILE
# ========================
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(DATASET_PATH, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Optional validation
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file_path)
            if df.empty:
                raise HTTPException(status_code=400, detail="Empty CSV file")

        # Rebuild RAG index
        engine.load_dataset()

        return {"status": "success", "filename": file.filename}

    except Exception as e:
        print(f"❌ UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Upload failed")

# ========================
# LIST FILES
# ========================
@app.get("/list-files")
async def list_files():
    files = []

    if os.path.exists(DATASET_PATH):
        for filename in os.listdir(DATASET_PATH):
            path = os.path.join(DATASET_PATH, filename)

            stats = os.stat(path)

            files.append({
                "name": filename,
                "type": filename.split(".")[-1],
                "size": f"{round(stats.st_size / 1024, 1)} KB"
            })

    return files

# ========================
# DELETE FILE
# ========================
@app.delete("/delete-file/{filename}")
async def delete_file(filename: str):
    file_path = os.path.join(DATASET_PATH, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    os.remove(file_path)

    # rebuild index
    engine.load_dataset()

    return {"message": "Deleted successfully"}

# ========================
# LOGS (FIX FOR FRONTEND)
# ========================
@app.get("/logs")
async def logs():
    # placeholder (you can later connect DB)
    return []
