import os
import json
import faiss
import numpy as np
import pandas as pd
import requests

from sentence_transformers import SentenceTransformer
from pypdf import PdfReader
from docx import Document


class AmazonRAG:

    def __init__(self):

        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        self.documents = []
        self.index = None

        self.index_path = "faiss.index"
        self.docs_path = "documents.json"

        self.load_persisted()

    # -------------------------
    # LOAD EXISTING DATA
    # -------------------------
    def load_persisted(self):

        if os.path.exists(self.docs_path):

            with open(self.docs_path, "r", encoding="utf-8") as f:
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

        with open(self.docs_path, "w", encoding="utf-8") as f:
            json.dump(self.documents, f)

        if self.index:
            faiss.write_index(self.index, self.index_path)

    # -------------------------
    # TEXT CHUNKING
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
    # ADD FILE
    # -------------------------
    def add_file(self, path):

        new_docs = []

        # CSV
        if path.endswith(".csv"):

            df = pd.read_csv(path)

            col = df.columns[0]

            for text in df[col].astype(str).tolist():
                new_docs.extend(self.chunk_text(text))

        # PDF
        elif path.endswith(".pdf"):

            reader = PdfReader(path)

            full_text = ""

            for page in reader.pages:
                full_text += page.extract_text() or ""

            new_docs.extend(self.chunk_text(full_text))

        # TXT / MD
        elif path.endswith(".txt") or path.endswith(".md"):

            with open(path, "r", encoding="utf-8") as f:
                text = f.read()

            new_docs.extend(self.chunk_text(text))

        # DOCX
        elif path.endswith(".docx"):

            doc = Document(path)

            text = "\n".join([p.text for p in doc.paragraphs])

            new_docs.extend(self.chunk_text(text))

        else:
            return

        self.documents.extend(new_docs)

        self.rebuild_index()
        self.save_all()

    # -------------------------
    # REBUILD VECTOR INDEX
    # -------------------------
    def rebuild_index(self):

        if not self.documents:
            self.index = None
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
    # SEARCH
    # -------------------------
    def search(self, query, top_k=3):

        if not self.index or not self.documents:

            return {
                "answer": "No knowledge base loaded.",
                "sources": [],
                "confidence": 0.0
            }

        q_emb = self.model.encode([query]).astype("float32")

        distances, indices = self.index.search(q_emb, top_k)

        results = [
            self.documents[i]
            for i in indices[0]
            if i != -1
        ]

        context = "\n\n".join(results)

        answer = self.generate_answer(query, context)

        confidence = float(max(0.0, min(1.0, 1 / (1 + distances[0][0]))))

        return {
            "answer": answer,
            "sources": results[:2],
            "confidence": confidence
        }

    # -------------------------
    # LLM GENERATION
    # -------------------------
    def generate_answer(self, question, context):

        API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

        headers = {
            "Authorization": f"Bearer {os.getenv('HF_API_KEY')}"
        }

        prompt = f"""
You are an intelligent support AI.

Rules:
- Use ONLY the context
- If answer is missing say "I don't know"

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

            response = requests.post(
                API_URL,
                headers=headers,
                json=payload,
                timeout=60
            )

            result = response.json()

            if isinstance(result, list) and "generated_text" in result[0]:
                return result[0]["generated_text"]

            if isinstance(result, dict):
                return result.get("generated_text", "No response generated.")

            return "Unable to generate response."

        except Exception as e:

            print("LLM ERROR:", e)

            return "AI service temporarily unavailable."
