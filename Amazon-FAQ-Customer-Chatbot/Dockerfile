FROM python:3.9

# This line is the most important—it stops FAISS from crashing!
RUN apt-get update && apt-get install -y libgomp1 && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# Tell the computer to look INSIDE the backend folder for your requirements
COPY backend/requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Tell the computer to take everything INSIDE backend and put it here
COPY backend/ .

EXPOSE 7860

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
