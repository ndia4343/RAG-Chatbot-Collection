import os
import glob
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader

class AmazonRAG:
    def __init__(self):
        """Initializes the AI model once so it stays in memory."""
        print("🤖 Loading SentenceTransformer model...")
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.index = None
        self.data = None
        # Load whatever is in the folder immediately on startup
        self.load_dataset()

    def find_dataset(self):
        """Finds all valid files in the dataset directory."""
        # Ensure directory exists
        if not os.path.exists("dataset"):
            os.makedirs("dataset")
            
        files = glob.glob("dataset/*.csv") + glob.glob("dataset/*.pdf")
        return files

    def load_dataset(self):
        """AGGREGATOR: Merges all files in /dataset into one unified brain."""
        file_paths = self.find_dataset()
        all_texts = []
        all_metadata = []

        if not file_paths:
            print("⚠️ Dataset folder is empty. AI is in standby.")
            self.data = pd.DataFrame(columns=["title", "answer"])
            self.index = None
            return

        for path in file_paths:
            file_name = os.path.basename(path)
            
            # --- CSV Processing ---
            if path.endswith('.csv'):
                try:
                    df = pd.read_csv(path)
                    q_col = next((c for c in df.columns if 'question' in c.lower()), df.columns[0])
                    a_col = next((c for c in df.columns if 'answer' in c.lower()), df.columns[-1])
                    
                    for _, row in df.iterrows():
                        all_texts.append(f"{row[q_col]} {row[a_col]}")
                        all_metadata.append({
                            "title": f"{file_name}", 
                            "answer": str(row[a_col])
                        })
                except Exception as e:
                    print(f"❌ Error loading CSV {file_name}: {e}")

            # --- PDF Processing ---
            elif path.endswith('.pdf'):
                try:
                    reader = PdfReader(path)
                    for i, page in enumerate(reader.pages):
                        content = page.extract_text()
                        if content:
                            clean_content = content.replace('\n', ' ').strip()
                            all_texts.append(clean_content)
                            all_metadata.append({
                                "title": f"{file_name} (Pg {i+1})", 
                                "answer": clean_content
                            })
                except Exception as e:
                    print(f"❌ Error loading PDF {file_name}: {e}")

        # Finalize the FAISS Index
        if all_texts:
            self.data = pd.DataFrame(all_metadata)
            embeddings = self.model.encode(all_texts, convert_to_numpy=True)
            faiss.normalize_L2(embeddings)
            
            dimension = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dimension)
            self.index.add(embeddings)
            print(f"✅ BRAIN READY: {len(all_texts)} chunks from {len(file_paths)} files.")

    def search(self, query, top_k=3):
        """Returns the best answer and unique source names."""
        if self.index is None or self.data is None or self.data.empty:
            return {"answer": "I have no knowledge base loaded.", "sources": []}

        query_vec = self.model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_vec)
        scores, indices = self.index.search(query_vec, top_k)
        
        valid_answers = []
        sources_seen = set()
        sources_list = []
        
        for i in range(min(top_k, len(self.data))):
            idx = indices[0][i]
            score = float(scores[0][i])
            
            if idx != -1 and idx < len(self.data) and score > 0.35:
                row = self.data.iloc[idx]
                valid_answers.append(row["answer"])
                
                source_name = row["title"]
                if source_name not in sources_seen:
                    sources_list.append({"name": source_name})
                    sources_seen.add(source_name)

        if not valid_answers:
            return {"answer": "I couldn't find a definitive answer in the documents.", "sources": []}
            
        return {
            "answer": valid_answers[0], 
            "sources": sources_list
        }
