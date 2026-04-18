# 📌 Amazon RAG Chatbot (AI-Powered FAQ Assistant)

A Retrieval-Augmented Generation (RAG) AI Chatbot built with FastAPI, FAISS, Sentence Transformers, and Next.js.
It answers Amazon-related queries using a custom knowledge base with semantic search + AI retrieval system.

# 🚀 Live Architecture
Frontend (Next.js + Tailwind + Glass UI)
        ↓ API Call
Backend (FastAPI on Hugging Face Spaces)
        ↓
RAG Pipeline (FAISS + SentenceTransformer)
        ↓
Amazon FAQ Dataset (CSV)

## ✨ Features
🔍 AI-powered semantic search (FAISS vector database)
🤖 RAG-based answer generation (context-aware responses)
⚡ FastAPI backend (high-performance API)
🎯 Sentence Transformers embedding model
📊 Confidence-based ranking of results
💬 Source-based answer verification
🎨 Modern frontend (Glassmorphism UI + Dark/Light mode)
🔄 Real-time query processing
📡 Fully deployed (Vercel + Hugging Face)

## 🧠 Tech Stack
Backend
FastAPI
FAISS (Vector Search)
SentenceTransformers (MiniLM model)
Pandas
Python
Frontend
Next.js (App Router)
TypeScript
Tailwind CSS
Framer Motion
next-themes
Deployment
Hugging Face Spaces (Backend)
Vercel (Frontend)

## 📂 Project Structure
backend/
│
├── main.py              # FastAPI app
├── rag_pipeline.py      # RAG logic (FAISS + embeddings)
├── database.py          # Logging + feedback system
├── dataset/
│    └── amazon_products.csv
│
└── requirements.txt


frontend/
│
├── app/
├── components/
├── lib/
│    └── api.ts
├── styles/
└── tailwind.config.js

## ⚙️ Backend Setup (Local)
1. Install dependencies
pip install -r requirements.txt

2. Run backend
uvicorn main:app --reload

Backend runs on:

http://localhost:8000

## 🌐 API Endpoints
🔹 Health Check
GET /health
Response:
{
  "status": "ok",
  "docs_indexed": 120
}

## 🔹 Search (RAG Engine)
POST /api/search
Request:
{
  "query": "How do I track my order?",
  "top_k": 3
}
Response:
{
  "log_id": 1,
  "answer": "You can track your order using...",
  "sources": [
    {
      "id": "12",
      "title": "Order Tracking",
      "short_answer": "Track via account page",
      "answer": "You can track orders in your Amazon account...",
      "relevance": 0.92
    }
  ],
  "processing_time_ms": 120
}
🔹 Feedback API
POST /api/feedback

## 🎨 Frontend Features
Glassmorphism UI cards
AI typing animation
Loading skeleton system
Glow animated background
Dark/Light mode toggle
Real-time API integration
Source-based answer expansion

## 🔐 CORS Configuration

Backend supports:
http://localhost:3000
http://127.0.0.1:3000
https://your-vercel-app.vercel.app

## 📦 Environment Variables
Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://your-huggingface-space.hf.space

## 🚀 Deployment
Backend (Hugging Face Spaces)
Push code to GitHub
Connect Hugging Face Space
Add requirements.txt
Deploy FastAPI app

## Frontend (Vercel)
1.Import GitHub repo
2. Set environment variable:
NEXT_PUBLIC_API_URL
3. Deploy

## 🧠 How It Works
User enters query
SentenceTransformer converts text → embeddings
FAISS finds most similar FAQs
RAG pipeline selects best answer
API returns structured response
Frontend displays answer + sources

## 📊 Dataset

The chatbot uses an Amazon product dataset containing:

* product name
* category
* price
* discount
* rating
* reviews
* product description

This information is converted into vector embeddings and indexed using FAISS for retrieval.

---

## 🔮 Future Improvements

* LLM-generated answers using GPT models
* Chat memory
* Multi-product comparison
* Enhanced UI with Tailwind CSS
* Support for multiple RAG chatbot systems
