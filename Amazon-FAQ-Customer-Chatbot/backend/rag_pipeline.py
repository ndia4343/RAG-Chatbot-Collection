import os
import json
import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader
import requests

class AmazonRAG:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.documents = []

        self.index_path = "faiss.index"
        self.docs_path = "documents.json"

        self.load_persisted()

    # -----------------------------
    # LOAD SAVED DATA
    # -----------------------------
    def load_persisted(self):
        if os.path.exists(self.docs_path):
            with open(self.docs_path, "r") as f:
                self.documents = json.load(f)

        if os.path.exists(self.index_path) and self.documents:
            self.index = faiss.read_index(self.index_path)
        else:
            self.index = None

    # -----------------------------
    # SAVE DATA
    # -----------------------------
    def save_all(self):
        with open(self.docs_path, "w") as f:
            json.dump(self.documents, f)

        if self.index:
            faiss.write_index(self.index, self.index_path)

    # -----------------------------
    # LOAD FILES
    # -----------------------------
    def add_file(self, path):
        if path.endswith(".csv"):
            df = pd.read_csv(path)
            col = df.columns[0]
            self.documents.extend(df[col].astype(str).tolist())

        elif path.endswith(".pdf"):
            reader = PdfReader(path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            self.documents.append(text)

        self.build_index()
        self.save_all()

    # -----------------------------
    # BUILD INDEX
    # -----------------------------
    def build_index(self):
        if not self.documents:
            return

        embeddings = self.model.encode(self.documents)
        dim = embeddings.shape[1]

        self.index = faiss.IndexFlatL2(dim)
        self.index.add(np.array(embeddings).astype("float32"))

    # -----------------------------
    # SEARCH + GENERATE
    # -----------------------------
    def search(self, query, top_k=3):
        if not self.index:
            return {"answer": "No knowledge base loaded", "sources": []}

        q = self.model.encode([query]).astype("float32")
        dist, idx = self.index.search(q, top_k)

        results = [self.documents[i] for i in idx[0] if i != -1]

        context = "\n".join(results)

        answer = self.generate_answer(query, context)

        return {
            "answer": answer,
            "sources": results[:2],
            "confidence": float(1 - dist[0][0] / 2)
        }

    # -----------------------------
    # LLM
    # -----------------------------
    def generate_answer(self, question, context):
        API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
        headers = {"Authorization": f"Bearer {os.getenv('HF_API_KEY')}"}

        prompt = f"""You are Amazon support AI.
Answer ONLY from context.

Context:
{context}

Question:
{question}

Answer:"""

        payload = {
            "inputs": prompt,
            "parameters": {"max_new_tokens": 200}
        }

        r = requests.post(API_URL, headers=headers, json=payload)
        result = r.json()

        try:
            return result[0]["generated_text"]
        except:
            return "Unable to generate response."
