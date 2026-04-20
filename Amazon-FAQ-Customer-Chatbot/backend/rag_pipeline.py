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
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        self.documents = []
        self.index = None

        self.index_path = "faiss.index"
        self.docs_path = "documents.json"

        self.load_persisted()

    # -------------------------
    # LOAD SAVED DATA
    # -------------------------
    def load_persisted(self):
        if os.path.exists(self.docs_path):
            with open(self.docs_path, "r") as f:
                self.documents = json.load(f)

        if self.documents and os.path.exists(self.index_path):
            try:
                self.index = faiss.read_index(self.index_path)
            except:
                self.rebuild_index()
        else:
            self.index = None

    # -------------------------
    # SAVE DATA
    # -------------------------
    def save_all(self):
        with open(self.docs_path, "w") as f:
            json.dump(self.documents, f)

        if self.index:
            faiss.write_index(self.index, self.index_path)

    # -------------------------
    # TEXT CHUNKING (SAAS FIX)
    # -------------------------
    def chunk_text(self, text, chunk_size=400, overlap=80):
        words = text.split()
        chunks = []

        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)

        return chunks

    # -------------------------
    # ADD FILE (FIXED FOR SaaS PIPELINE)
    # -------------------------
    def add_file(self, path):
        new_docs = []

        if path.endswith(".csv"):
            df = pd.read_csv(path)
            col = df.columns[0]

            for text in df[col].astype(str).tolist():
                new_docs.extend(self.chunk_text(text))

        elif path.endswith(".pdf"):
            reader = PdfReader(path)
            full_text = ""

            for page in reader.pages:
                full_text += page.extract_text() or ""

            new_docs.extend(self.chunk_text(full_text))

        self.documents.extend(new_docs)

        self.rebuild_index()
        self.save_all()

    # -------------------------
    # BUILD INDEX (SAFE + FAST)
    # -------------------------
    def rebuild_index(self):
        if not self.documents:
            return

        embeddings = self.model.encode(
            self.documents,
            show_progress_bar=False
        )

        embeddings = np.array(embeddings).astype("float32")

        dim = embeddings.shape[1]

        self.index = faiss.IndexFlatL2(dim)
        self.index.add(embeddings)

    # -------------------------
    # SEARCH (FIXED CONFIDENCE)
    # -------------------------
    def search(self, query, top_k=3):
        if not self.index or not self.documents:
            return {
                "answer": "No knowledge base loaded",
                "sources": [],
                "confidence": 0.0
            }

        q_emb = self.model.encode([query]).astype("float32")

        dist, idx = self.index.search(q_emb, top_k)

        results = [
            self.documents[i]
            for i in idx[0]
            if i != -1
        ]

        context = "\n".join(results)

        answer = self.generate_answer(query, context)

        # FIXED confidence (REALISTIC SCORING)
        confidence = float(max(0.0, min(1.0, 1 / (1 + dist[0][0]))))

        return {
            "answer": answer,
            "sources": results[:2],
            "confidence": confidence
        }

    # -------------------------
    # LLM CALL (SAFE + STABLE)
    # -------------------------
    def generate_answer(self, question, context):
        API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

        headers = {
            "Authorization": f"Bearer {os.getenv('HF_API_KEY')}"
        }

        prompt = f"""
You are an Amazon support AI assistant.

RULES:
- Use ONLY the context
- If answer not found, say "I don't know"

Context:
{context}

Question:
{question}

Answer:
"""

        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 200,
                "temperature": 0.7
            }
        }

        try:
            r = requests.post(API_URL, headers=headers, json=payload)
            result = r.json()

            if isinstance(result, list) and "generated_text" in result[0]:
                return result[0]["generated_text"]

            if isinstance(result, dict):
                return result.get("generated_text", "No response generated.")

            return "Unable to generate response."

        except Exception as e:
            print("LLM ERROR:", e)
            return "AI service temporarily unavailable."
