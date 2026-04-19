import pandas as pd
import faiss
import os
import glob
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader

class AmazonRAG:
    def __init__(self):
        # Using a fast, lightweight model perfect for Hugging Face free tier
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.index = None
        self.data = None

    def find_dataset(self):
        """Finds ANY csv or pdf in the dataset folder."""
        # Check specific dataset folder first, then local directory
        files = glob.glob("dataset/*.csv") + glob.glob("dataset/*.pdf") + \
                glob.glob("*.csv") + glob.glob("*.pdf")
        return files[0] if files else None

    def load_dataset(self):
        """Clears old index and loads new data from files."""
        file_path = self.find_dataset()
        
        # Reset the index and data to ensure a clean sync
        self.index = None
        self.data = None
        
        if not file_path:
            print("⚠️ No knowledge base found. Starting in standby mode.")
            self.data = pd.DataFrame(columns=["title", "answer"])
            return

        print(f"📂 Loading knowledge from: {file_path}")
        texts = []
        metadata = []

        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
            q_col = next((c for c in df.columns if 'question' in c.lower()), df.columns[0])
            a_col = next((c for c in df.columns if 'answer' in c.lower()), df.columns[-1])
            
            for _, row in df.iterrows():
                combined = f"{row[q_col]} {row[a_col]}"
                texts.append(combined)
                metadata.append({"title": str(row[q_col]), "answer": str(row[a_col])})
            self.data = pd.DataFrame(metadata)

        elif file_path.endswith('.pdf'):
            reader = PdfReader(file_path)
            for i, page in enumerate(reader.pages):
                content = page.extract_text()
                if content:
                    # Clean up text for better embedding quality
                    clean_content = content.replace('\n', ' ').strip()
                    texts.append(clean_content)
                    metadata.append({"title": f"PDF Page {i+1}", "answer": clean_content})
            self.data = pd.DataFrame(metadata)

        if texts:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            dimension = embeddings.shape[1]
            # Inner Product + Normalization = Cosine Similarity
            self.index = faiss.IndexFlatIP(dimension)
            faiss.normalize_L2(embeddings)
            self.index.add(embeddings)
            print(f"✅ Indexed {len(texts)} chunks of knowledge.")

    def search(self, query, top_k=3):
        if self.index is None or self.data is None or self.data.empty:
            return "Knowledge base is currently empty. Please upload a PDF/CSV to the /dataset folder.", []

        query_vec = self.model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_vec)
        scores, indices = self.index.search(query_vec, top_k)
        
        results = []
        for i in range(min(top_k, len(self.data))):
            idx = indices[0][i]
            if idx != -1 and idx < len(self.data):
                row = self.data.iloc[idx]
                results.append({
                    "title": row["title"],
                    "answer": row["answer"],
                    "relevance": float(scores[0][i])
                })

        # Threshold check: 0.35 is a good balance for this model
        if not results or results[0]["relevance"] < 0.35:
            return "I couldn't find a definitive answer in my documentation. Please contact support@example.com for further help.", results
            
        return results[0]["answer"], results
