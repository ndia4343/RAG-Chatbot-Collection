@app.post("/query")
async def query_bot(request: dict):
    # 1. Validation
    question = request.get("question")
    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        # 2. Execution
        # We call the engine. It now handles the FAISS search AND metadata formatting.
        output = engine.search(question)

        # 3. Professional Response
        # We return the exact keys your Next.js frontend is expecting: 
        # 'answer' (string) and 'sources' (list of objects)
        return {
            "answer": output["answer"],
            "confidence": 0.95, 
            "sources": output["sources"] 
        }

    except Exception as e:
        # RUTHLESS TIP: Always log the error on the server so you can fix it, 
        # but don't send the full stack trace to the client for security.
        print(f"CRITICAL SEARCH ERROR: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="The AI Engine encountered an error processing your request."
        )
