# Amazon FAQ Customer Support Chatbot

This project is a **Retrieval-Augmented Generation (RAG) chatbot** that answers customer questions using an Amazon product dataset.

The chatbot retrieves relevant product information using **semantic search** and returns the most relevant response to the user.

---

## 🚀 Features

* **Semantic Search:** Uses sentence embeddings to retrieve the most relevant product information.
* **Fast Retrieval:** Powered by FAISS vector search for efficient similarity matching.
* **API Backend:** Built with FastAPI to handle chatbot queries.
* **Modern Chat Interface:** Frontend built with Next.js.
* **Scalable Architecture:** Designed so multiple RAG chatbots can be added in the repository.

---

## 🛠 Tech Stack

### Backend

* Python
* FastAPI
* Sentence Transformers
* FAISS Vector Search
* Pandas / NumPy

### Frontend

* Next.js
* React
* CSS / Tailwind (optional)


### Deployment

* Backend: Hugging Face Spaces
* Frontend: Vercel
* Version Control: GitHub

---

## 🧠 RAG Architecture

User Query
↓
Frontend Chat Interface
↓
FastAPI Backend
↓
Sentence Transformer Embedding
↓
FAISS Vector Search
↓
Retrieve Relevant Product Information
↓
Return Answer to User

---

## 📂 Project Structure

```
RAG-Chatbot-Collection
│
└── Amazon-FAQ-Customer-Chatbot
    │
    ├── backend
    │   ├── main.py
    │   ├── rag_engine.py
    │   ├── requirements.txt
    │   └── dataset
    │       └── amazon_products.csv
    │
    ├── frontend
    │   ├── pages
    │   │   └── index.js
    │   ├── styles
    │   │   └── globals.css
    │   └── package.json
    │
    └── README.md
```

---

## ⚙️ Running the Backend

Navigate to backend folder:

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Open API documentation:

```
http://127.0.0.1:8000/docs
```

---

## 🌐 Deployment

* Backend deployed on **Hugging Face Spaces**
* Frontend deployed on **Vercel**
* Repository hosted on **GitHub**

---

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
