from fastapi import FastAPI
from rag_engine import AmazonRAGEngine

app = FastAPI()

# Load RAG engine with dataset
engine = AmazonRAGEngine("dataset/amazon_products.csv")


@app.get("/")
def home():
    return {"message": "Amazon RAG Chatbot API is running"}


@app.get("/search")
def search(query: str):
    results = engine.search(query)
    return {"results": results}
