import pandas as pd
import faiss
import os
from sentence_transformers import SentenceTransformer


class AmazonRAG:

    def __init__(self):

        # Lightweight fast embedding model
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        self.index = None
        self.data = None


    def find_dataset(self):
        """
        Automatically find dataset location
        Works for GitHub + HuggingFace
        """

        possible_paths = [

            "dataset/amazon_products.csv",

            "../dataset/amazon_products.csv",

            "../../dataset/amazon_products.csv",

            "amazon_products.csv"
        ]

        for path in possible_paths:

            if os.path.exists(path):
                return path

        raise FileNotFoundError(
            "amazon_products.csv not found in expected locations."
        )


    def load_dataset(self):

        dataset_path = self.find_dataset()

        print(f"📂 Loading dataset from: {dataset_path}")

        self.data = pd.read_csv(dataset_path)

        required_columns = ["Question", "Short Answer", "Answer"]

        for col in required_columns:
            if col not in self.data.columns:
                raise ValueError(f"Dataset missing column: {col}")

        combined_text = (
            self.data["Question"].astype(str)
            + " "
            + self.data["Answer"].astype(str)
        )

        embeddings = self.model.encode(
            combined_text.tolist(),
            convert_to_numpy=True
        )

        dimension = embeddings.shape[1]

        self.index = faiss.IndexFlatIP(dimension)

        faiss.normalize_L2(embeddings)

        self.index.add(embeddings)

        print(f"✅ Indexed {len(self.data)} knowledge entries")


    def search(self, query, top_k=3):

        query_vec = self.model.encode([query], convert_to_numpy=True)

        faiss.normalize_L2(query_vec)

        scores, indices = self.index.search(query_vec, top_k)

        results = []

        for i in range(top_k):

            idx = indices[0][i]

            row = self.data.iloc[idx]

            results.append({
                "id": str(idx),
                "title": row["Question"],
                "short_answer": row["Short Answer"],
                "answer": row["Answer"],
                "relevance": float(scores[0][i])
            })

        return results[0]["short_answer"], results


# -----------------------------
# Local testing
# -----------------------------

if __name__ == "__main__":

    rag = AmazonRAG()

    try:

        print("🔍 Initializing Amazon RAG system")

        rag.load_dataset()

        query = "How do I track my order?"

        print(f"\n📡 Query: {query}")

        answer, sources = rag.search(query)

        print("\n🤖 BOT RESPONSE:")
        print(answer)

        print("\n🔗 SOURCES:")

        for i, src in enumerate(sources):
            print(
                f"[{i+1}] {src['title']} "
                f"(Match: {src['relevance']:.2%})"
            )

    except Exception as e:

        print(f"❌ Error: {e}")
