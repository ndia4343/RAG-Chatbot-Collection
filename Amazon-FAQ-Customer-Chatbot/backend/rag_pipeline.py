def search(self, query, top_k=3):
        if self.index is None or self.data is None or self.data.empty:
            return "Knowledge base is empty.", []

        # 1. Encode and Search
        query_vec = self.model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_vec)
        scores, indices = self.index.search(query_vec, top_k)
        
        results = []
        sources = []
        
        for i in range(min(top_k, len(self.data))):
            idx = indices[0][i]
            if idx != -1 and idx < len(self.data):
                row = self.data.iloc[idx]
                score = float(scores[0][i])
                
                # Only include results that actually match (Threshold)
                if score > 0.35:
                    results.append(row["answer"])
                    # Extract the filename or title for the source badge
                    sources.append({"name": row["title"]})

        # 2. RUTHLESS FIX: Return an object that matches the "Expert" UI needs
        if not results:
            return {
                "answer": "I couldn't find a definitive answer in the uploaded documents.",
                "sources": []
            }
            
        return {
            "answer": results[0], # The top match
            "sources": sources    # List of files/pages found
        }
