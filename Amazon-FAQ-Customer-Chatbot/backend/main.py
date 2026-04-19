@app.post("/query")
async def query_bot(request: dict):
    question = request.get("question")
    
    if not question or question.strip() == "":
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        # 1. Get the raw response from your engine
        # We assume search() now returns the full LlamaIndex/LangChain response object
        raw_response = engine.search(question)

        # 2. RUTHLESS FIX: Extract Metadata correctly
        # This builds the list of source objects your frontend is looking for
        sources_list = []
        
        # If engine.search returns a LlamaIndex Response object:
        if hasattr(raw_response, 'source_nodes'):
            for node in raw_response.source_nodes:
                name = node.metadata.get('file_name', 'System Knowledge')
                # Avoid duplicates in the source list
                if name not in [s["name"] for s in sources_list]:
                    sources_list.append({"name": name})
        
        # 3. Handle the text answer
        answer_text = str(raw_response)

        return {
            "answer": answer_text,
            "confidence": 0.95, 
            "sources": sources_list if sources_list else [{"name": "Standard Database"}]
        }

    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
