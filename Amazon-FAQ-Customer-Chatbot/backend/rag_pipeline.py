import pandas as pd
import faiss
import os
import glob
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader 

class AmazonRAG:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.index = None
        self.data = None

    def find_dataset(self):
        """Finds ANY csv or pdf in the dataset folder."""
        # Looks for files in dataset/ or local directory
        files = glob.glob("dataset/*.csv") + glob.glob("dataset/*.pdf") + \
                glob.glob("*.csv") + glob.glob("*.pdf")
        
        if files:
            return files[0] 
        # Instead of crashing, we return None so the app can still start
        return None

    def load_dataset(self):
        file_path = self.find_dataset()
        
        if not file_path:
            print("⚠️ No knowledge base found. Starting in standby mode.")
            self.data = pd.DataFrame(columns=["title", "answer"])
            return

        print(f"📂 Loading knowledge from: {file_path}")
        texts = []
        metadata = []

        if file_path.endswith('.csv'):
            self.data = pd.read_csv(file_path)
            q_col = next((c for c in self.data.columns if 'question' in c.lower()), self.data.columns[0])
            a_col = next((c for c in self.data.columns if 'answer' in c.lower()), self.data.columns[-1])
            
            for _, row in self.data.iterrows():
                combined = f"{row[q_col]} {row[a_col]}"
                texts.append(combined)
                metadata.append({"title": str(row[q_col]), "answer": str(row[a_col])})
                
        elif file_path.endswith('.pdf'):
            reader = PdfReader(file_path)
            for i, page in enumerate(reader.pages):
                content = page.extract_text()
                if content:
                    texts.append(content)
                    metadata.append({"title": f"PDF Page {i+1}", "answer": content})
            self.data = pd.DataFrame(metadata)

        if texts:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            dimension = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dimension)
            faiss.normalize_L2(embeddings)
            self.index.add(embeddings)
            print(f"✅ Indexed {len(texts)} chunks of knowledge.")

    def search(self, query, top_k=3):
        # Fallback if no index exists
        if self.index is None:
            return "I'm sorry, my knowledge base is currently empty. Please contact our support team at support@example.com.", []

        query_vec = self.model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_vec)
        scores, indices = self.index.search(query_vec, top_k)
        
        results = []
        for i in range(top_k):
            idx = indices[0][i]
            if idx < len(self.data):
                row = self.data.iloc[idx]
                results.append({
                    "title": row["title"],
                    "answer": row["answer"],
                    "relevance": float(scores[0][i])
                })
        
        # Professional Threshold: If relevance is low, trigger support message
        if not results or results[0]["relevance"] < 0.35:
            return "I couldn't find a definitive answer in my documentation. Please contact our support team at support@example.com or call 1-800-HELP.", results
            
        return results[0]["answer"], results
