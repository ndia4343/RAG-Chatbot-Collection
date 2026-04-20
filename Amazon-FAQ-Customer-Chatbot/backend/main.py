from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from rag_pipeline import AmazonRAG

app = FastAPI()

# 1. Enable CORS for your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your Vercel URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Initialize the Engine ONCE
# This loads the model into memory and scans the /dataset folder on boot
engine = AmazonRAG()

@app.post("/query")
async def query_bot(request: dict):
    # Validation
    question = request.get("question")
    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        # Execution
        output = engine.search(question)

        # Return exact keys for Next.js: 'answer' and 'sources'
        return {
            "answer": output["answer"],
            "confidence": 0.95, 
            "sources": output["sources"] 
        }

    except Exception as e:
        print(f"❌ CRITICAL SEARCH ERROR: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="The AI Engine encountered an error processing your request."
        )

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Ensure directory exists
        os.makedirs("dataset", exist_ok=True)
        
        file_path = os.path.join("dataset", file.filename)
        
        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # CRITICAL: Re-read the folder so the AI learns the new file immediately
        engine.load_dataset()
        
        return {"status": "success", "filename": file.filename}
    
    except Exception as e:
        print(f"❌ UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save file.")

@app.get("/list-files")
async def list_files():
    """Returns real-time data for the Knowledge Base table."""
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
    """Removes file from disk and triggers AI to forget it."""
    file_path = os.path.join("dataset", filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        engine.load_dataset() # Trigger re-index
        return {"message": "Deleted successfully"}
    raise HTTPException(status_code=404, detail="File not found")
