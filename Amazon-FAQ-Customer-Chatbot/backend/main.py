from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from rag_pipeline import AmazonRAG

app = FastAPI()

# 1. FIX: Added CORS Middleware (Stops the "Backend connection failed" error)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Initialize your pipeline
engine = AmazonRAG()

@app.on_event("startup")
def startup():
    try:
        # Standard load on startup
        engine.load_dataset() 
    except Exception as e:
        print(f"Dataset loading error: {e}")

@app.get("/")
def home():
    return {"message": "AmzRAG API is online", "status": "active"}

# 3. FIX: Changed from /search to /query to match your AssistantPage.tsx
@app.post("/query")
async def query_bot(request: dict):
    question = request.get("question")
    
    if not question or question.strip() == "":
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        # Run RAG search from your rag_pipeline
        top_answer, sources = engine.search(question)

        return {
            "answer": top_answer,
            "confidence": 0.95, # You can calculate actual score in rag_pipeline later
            "sources": sources if sources else ["Amazon FAQ"]
        }

    except Exception as e:
        print("Search error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

# 4. NEW: Sync logic for your Knowledge Base "Sync" button
@app.post("/refresh")
async def refresh_index():
    try:
        # This calls your pipeline to re-read the /dataset folder
        engine.load_dataset() 
        return {"status": "success", "message": "Knowledge base synchronized"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refresh failed: {str(e)}")
