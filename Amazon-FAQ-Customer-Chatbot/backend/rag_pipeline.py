import os
import pandas as pd
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader
import requests


class AmazonRAG:

    def __init__(self):
        # Load embedding model once
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        self.index = None
        self.documents = []

        # Dataset folder
        self.dataset_path = "dataset"

        # Load dataset at startup
        self.load_dataset()


    def load_dataset(self):
        """Load CSV/PDF files and build FAISS index."""

        self.documents = []

        if not os.path.exists(self.dataset_path):
            os.makedirs(self.dataset_path)
            return

        for filename in os.listdir(self.dataset_path):

            path = os.path.join(self.dataset_path, filename)

            try:

                # ---------- CSV FILES ----------
                if filename.endswith(".csv"):

                    df = pd.read_csv(path)

                    text_columns = [
                        "question",
                        "answer",
                        "text",
                        "content",
                        "description",
                        "query",
                        "response"
                    ]

                    target_col = next(
                        (col for col in df.columns if col.lower() in text_columns),
                        df.columns[0]
                    )

                    self.documents.extend(df[target_col].astype(str).tolist())

                # ---------- PDF FILES ----------
                elif filename.endswith(".pdf"):

                    reader = PdfReader(path)
                    pdf_text = ""

                    for page in reader.pages:
                        text = page.extract_text()
                        if text:
                            pdf_text += text + " "

                    # chunk long PDFs
                    chunks = [
                        pdf_text[i:i+500]
                        for i in range(0, len(pdf_text), 500)
                    ]

                    self.documents.extend(chunks)

            except Exception as e:
                print(f"⚠️ Failed reading {filename}: {e}")

        if self.documents:
            self._build_faiss_index()


    def _build_faiss_index(self):
        """Convert text into vector embeddings."""

        embeddings = self.model.encode(self.documents)

        dimension = embeddings.shape[1]

        self.index = faiss.IndexFlatL2(dimension)

        self.index.add(np.array(embeddings).astype("float32"))

        print(f"✅ Indexed {len(self.documents)} text segments.")


    def generate_answer(self, question, context):
        """Generate final answer using Hugging Face LLM."""

        api_key = os.getenv("HF_API_KEY")

        API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

        headers = {
            "Authorization": f"Bearer {api_key}"
        }

        prompt = f"""
You are an Amazon customer support AI.

Answer ONLY using the provided context.

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
                "return_full_text": False
            }
        }

        try:

            response = requests.post(API_URL, headers=headers, json=payload)

            result = response.json()

            # HF model warming up
            if isinstance(result, dict) and "estimated_time" in result:
                return "AI model is warming up. Please try again shortly."

            return result[0]["generated_text"].strip()

        except Exception as e:

            print(f"❌ LLM Error: {e}")

            return "AI system encountered an error."


    def search(self, query, top_k=3):
        """Retrieve context and generate final RAG answer."""

        if not self.index or not self.documents:

            return {
                "answer": "Knowledge base is empty. Please upload a file.",
                "sources": []
            }

        # Convert query to vector
        query_vector = self.model.encode([query]).astype("float32")

        # FAISS search
        distances, indices = self.index.search(query_vector, top_k)

        # Retrieve text chunks
        results = [self.documents[i] for i in indices[0] if i != -1]

        if not results:

            return {
                "answer": "I couldn't find anything in the dataset.",
                "sources": []
            }

        # Combine context
        context = "\n".join(results[:3])

        # Generate final answer
        answer = self.generate_answer(query, context)

        return {
            "answer": answer,
            "sources": results[:2],
            "confidence": float(max(0.0, 1 - distances[0][0]))
        }
