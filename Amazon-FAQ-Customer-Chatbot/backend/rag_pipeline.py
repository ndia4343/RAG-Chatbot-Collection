import os
import pandas as pd
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader
import requests
import os

class AmazonRAG:
    def __init__(self):
        # 1. Load the model once to save memory
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.documents = []
        self.dataset_path = "dataset"
        # Initial load attempt
        self.load_dataset()

    def load_dataset(self):
        """Clears old data and rebuilds the knowledge base from the folder."""
        self.documents = [] # CRITICAL: Clear memory so old files don't haunt the search
        
        if not os.path.exists(self.dataset_path):
            os.makedirs(self.dataset_path)
            return

        for filename in os.listdir(self.dataset_path):
            path = os.path.join(self.dataset_path, filename)
            
            try:
                # CSV Processing
                if filename.endswith('.csv'):
                    df = pd.read_csv(path)
                    # The 'Flexible Column Mapping' we discussed:
                    text_columns = ['question', 'text', 'content', 'description', 'Query', 'Answer']
                    target_col = next((col for col in df.columns if col in text_columns), df.columns[0])
                    self.documents.extend(df[target_col].astype(str).tolist())
                
                # PDF Processing
                elif filename.endswith('.pdf'):
                    reader = PdfReader(path)
                    pdf_text = ""
                    for page in reader.pages:
                        pdf_text += page.extract_text() + " "
                    # Split PDF into smaller chunks if it's long
                    self.documents.append(pdf_text.strip())
            
            except Exception as e:
                print(f"⚠️ Failed to read {filename}: {e}")

        if self.documents:
            self._build_faiss_index()

    def _build_faiss_index(self):
        """Converts text documents into searchable vectors."""
        embeddings = self.model.encode(self.documents)
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(np.array(embeddings).astype('float32'))
        print(f"✅ Indexed {len(self.documents)} text segments.")

    def search(self, query, top_k=3):
        """The function called by main.py /query endpoint."""
        if not self.index or not self.documents:
            return {"answer": "Knowledge base is empty. Please upload a file.", "sources": []}

        query_vector = self.model.encode([query]).astype('float32')
        distances, indices = self.index.search(query_vector, top_k)
        
        # Retrieve matching text
        results = [self.documents[i] for i in indices[0] if i != -1]
        
        if not results:
            return {"answer": "I couldn't find anything in the dataset for that.", "sources": []}

        # For a basic RAG, we return the top match. 
        # In a full Agentic flow, you'd pass this to a LLM to 'summarize'
        return {
            "answer": results[0], 
            "sources": results[:2],
            "confidence": float(1 - (distances[0][0] / 2)) # Simple distance-to-confidence logic
        }
