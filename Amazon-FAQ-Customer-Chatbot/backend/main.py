from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import pandas as pd
from rag_pipeline import AmazonRAG

app = FastAPI()

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


# PROFESSIONAL CORS SETUP
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, replace with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INITIALIZE AI ENGINE
engine = AmazonRAG()

@app.get("/")
async def health_check():
    return {"status": "online", "engine": "ready"}

@app.post("/query")
async def query_bot(request: dict):
    question = request.get("question")
    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        # Pass the question to the pipeline
        output = engine.search(question)
        
        # If the pipeline returns a confidence score, use it; otherwise, default to 0.95
        return {
            "answer": output.get("answer", "I'm sorry, I couldn't find a relevant answer."),
            "confidence": output.get("confidence", 0.95), 
            "sources": output.get("sources", [])
        }
    except Exception as e:
        print(f"❌ SEARCH ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="AI processing error")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
       DATASET_PATH = "/data/dataset"

      os.makedirs(DATASET_PATH, exist_ok=True)

     file_path = os.path.join(DATASET_PATH, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # --- NEW LOGIC: PRE-VALIDATION OF CSV COLUMNS ---
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file_path)
            # Check for common text columns
            text_columns = ['question', 'text', 'content', 'description', 'Query', 'Answer']
            target_col = next((col for col in df.columns if col in text_columns), None)
            
            if not target_col:
                print(f"⚠️ Warning: No standard text column found in {file.filename}. Using first column: {df.columns[0]}")
        # -----------------------------------------------

        # Force the engine to re-index
        engine.load_dataset()
        
        return {"status": "success", "filename": file.filename}
    except Exception as e:
        print(f"❌ UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process {file.filename}")

@app.get("/list-files")
async def list_files():
    files = []
    if os.path.exists("dataset"):
        for filename in os.listdir("dataset"):
            if filename.endswith(('.pdf', '.csv')):
                path = os.path.join("dataset", filename)
                stats = os.stat(path)
                files.append({
                    "name": filename,
                    "type": "pdf" if filename.endswith(".pdf") else "csv",
                    "size": f"{round(stats.st_size / 1024, 1)} KB",
                    "lastSync": "Synced"
                })
    return files

@app.delete("/delete-file/{filename}")
async def delete_file(filename: str):
    file_path = os.path.join("dataset", filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        engine.load_dataset() 
        return {"message": "Deleted successfully"}
    
    raise HTTPException(status_code=404, detail="File not found")
