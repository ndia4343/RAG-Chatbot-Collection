from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from rag_pipeline import AmazonRAG

app = FastAPI()

# 1. PROFESSIONAL CORS SETUP
# Note: When allow_credentials=True, allow_origins cannot be ["*"]
# Replace the Vercel URL with your actual project URL once deployed
origins = [
    "http://localhost:3000", 
    "https://your-app-name.vercel.app" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if os.getenv("PROD") else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. INITIALIZE AI ENGINE
# This loads the SentenceTransformer into memory once.
engine = AmazonRAG()

@app.get("/")
async def health_check():
    return {"status": "online", "engine": "ready"}

@app.post("/query")
async def query_bot(request: dict):
    """Handles chat queries from the Next.js frontend."""
    question = request.get("question")
    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        # engine.search returns {'answer': str, 'sources': list}
        output = engine.search(question)
        return {
            "answer": output["answer"],
            "confidence": 0.95, 
            "sources": output["sources"] 
        }
    except Exception as e:
        print(f"❌ SEARCH ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="AI processing error")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Saves file to disk and immediately updates the AI's brain."""
    try:
        os.makedirs("dataset", exist_ok=True)
        file_path = os.path.join("dataset", file.filename)
        
        # Save via streaming to handle larger PDFs safely
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Force the engine to re-index the folder including the new file
        engine.load_dataset()
        
        return {"status": "success", "filename": file.filename}
    except Exception as e:
        print(f"❌ UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save file.")

@app.get("/list-files")
async def list_files():
    """Provides the data for the Knowledge Base table in the UI."""
    files = []
    if os.path.exists("dataset"):
        for filename in os.listdir("dataset"):
            # Ignore hidden files like .gitkeep
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
    """Removes file and forces AI to 'forget' the data."""
    file_path = os.path.join("dataset", filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        # Re-build the index without the deleted file
        engine.load_dataset() 
        return {"message": "Deleted successfully"}
    
    raise HTTPException(status_code=404, detail="File not found")
