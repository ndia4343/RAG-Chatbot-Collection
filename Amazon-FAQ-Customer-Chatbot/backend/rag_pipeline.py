import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer

class RAGPipeline:
    def __init__(self):
        # Professional expert-grade model
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.index = None
        self.faq_data = None
        
    def load_dataset(self, path="data/amazon_faq.csv"):
        self.faq_data = pd.read_csv(path)
        # Create embeddings for search
        combined_text = self.faq_data['question'] + " " + self.faq_data['answer']
        embeddings = self.model.encode(combined_text.values)
        
        # Build FAISS index for lightning fast search
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dimension)
        faiss.normalize_L2(embeddings)
        self.index.add(embeddings)

    def search(self, query, top_k=3):
        query_vec = self.model.encode([query])
        faiss.normalize_L2(query_vec)
        scores, indices = self.index.search(query_vec, top_k)
        
        results = []
        for i in range(top_k):
            idx = indices[0][i]
            row = self.faq_data.iloc[idx]
            results.append({
                "id": str(idx),
                "title": row['question'], # Used for clickable chips
                "content": row['answer'],
                "relevance": float(scores[0][i])
            })
        return results[0]['content'], results

if __name__ == "__main__":
    # 1. Initialize the Pipeline
    tester = RAGPipeline()
    
    try:
        # 2. Attempt to Load Dataset
        print("🔍 Loading knowledge base...")
        tester.load_dataset("data/amazon_faq.csv")
        print(f"✅ Successfully indexed {len(tester.faq_data)} FAQ entries.")

        # 3. Perform Test Search
        test_query = "How do I track my order?"
        print(f"\n📡 Testing Query: '{test_query}'")
        
        answer, sources = tester.search(test_query, top_k=3)

        # 4. Detailed Console Output
        print("-" * 50)
        print(f"🤖 AI ANSWER: {answer}")
        print("-" * 50)
        
        print("🔗 SOURCE CHIPS (Verification):")
        if not sources:
            print("⚠️ No relevant sources found.")
        for i, src in enumerate(sources):
            # Formatted exactly like your dashboard chips will look
            print(f" [{i+1}] {src['title']} (Match: {src['relevance']:.2%})")
            
    except FileNotFoundError:
        print("❌ Error: 'data/amazon_faq.csv' not found. Check your file path.")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
