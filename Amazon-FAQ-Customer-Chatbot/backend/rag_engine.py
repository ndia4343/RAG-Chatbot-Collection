import pandas as pd
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


class AmazonRAGEngine:

    def __init__(self, dataset_path):

        # Load dataset
        self.df = pd.read_csv(dataset_path)

        # Combine useful columns for search
        self.df["combined"] = (
            self.df["product_name"].astype(str) + " " +
            self.df["category"].astype(str) + " " +
            self.df["about_product"].astype(str)
        )

        # Load embedding model
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        # Convert text → embeddings
        embeddings = self.model.encode(self.df["combined"].tolist())

        # Convert to numpy array
        embeddings = np.array(embeddings).astype("float32")

        # Create FAISS index
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)

        # Add embeddings to index
        self.index.add(embeddings)

        # Save embeddings for reference
        self.embeddings = embeddings


    def search(self, query, top_k=3):

        # Convert query to embedding
        query_vector = self.model.encode([query])
        query_vector = np.array(query_vector).astype("float32")

        # Search similar vectors
        distances, indices = self.index.search(query_vector, top_k)

        results = []

        for idx in indices[0]:

            product = self.df.iloc[idx]

            results.append({
                "product_name": product["product_name"],
                "category": product["category"],
                "price": product.get("actual_price", "N/A"),
                "rating": product.get("rating", "N/A"),
                "description": product["about_product"]
            })

        return results
