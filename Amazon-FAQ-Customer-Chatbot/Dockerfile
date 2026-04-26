FROM python:3.9-slim

# -----------------------------
# System dependencies (FAISS fix)
# -----------------------------
RUN apt-get update && apt-get install -y \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# -----------------------------
# Work directory
# -----------------------------
WORKDIR /app

# -----------------------------
# Copy backend requirements first (for caching)
# -----------------------------
COPY backend/requirements.txt /app/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# -----------------------------
# Copy backend code
# -----------------------------
COPY backend/ /app/backend/

# -----------------------------
# Copy dataset (IMPORTANT for RAG)
# -----------------------------
COPY dataset/ /app/dataset/

# -----------------------------
# Set Python path (important for imports)
# -----------------------------
ENV PYTHONPATH=/app/backend

# -----------------------------
# Expose FastAPI port
# -----------------------------
EXPOSE 8000

# -----------------------------
# Run FastAPI
# -----------------------------
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
