def find_dataset(self):
        """Strictly finds files in the production dataset folder."""
        # We only want files inside 'dataset/'. 
        # This ignores your GitHub samples and .gitkeep files automatically.
        files = glob.glob("dataset/*.csv") + glob.glob("dataset/*.pdf")
        return files

    def load_dataset(self):
        """Loops through ALL files in dataset/ and builds a combined brain."""
        file_paths = self.find_dataset()
        
        # Reset for a clean sync
        all_texts = []
        all_metadata = []

        if not file_paths:
            print("⚠️ Dataset folder is empty. AI is in standby.")
            self.data = pd.DataFrame(columns=["title", "answer"])
            self.index = None
            return

        for path in file_paths:
            file_name = os.path.basename(path)
            
            if path.endswith('.csv'):
                try:
                    df = pd.read_csv(path)
                    # Dynamic column detection (for messy CSVs)
                    q_col = next((c for c in df.columns if 'question' in c.lower()), df.columns[0])
                    a_col = next((c for c in df.columns if 'answer' in c.lower()), df.columns[-1])
                    
                    for _, row in df.iterrows():
                        all_texts.append(f"{row[q_col]} {row[a_col]}")
                        # Source is the filename + the specific question
                        all_metadata.append({"title": f"{file_name}: {row[q_col]}", "answer": str(row[a_col])})
                except Exception as e:
                    print(f"Error loading CSV {file_name}: {e}")

            elif path.endswith('.pdf'):
                try:
                    reader = PdfReader(path)
                    for i, page in enumerate(reader.pages):
                        content = page.extract_text()
                        if content:
                            clean_content = content.replace('\n', ' ').strip()
                            all_texts.append(clean_content)
                            # Source is the filename + Page number
                            all_metadata.append({"title": f"{file_name} (Page {i+1})", "answer": clean_content})
                except Exception as e:
                    print(f"Error loading PDF {file_name}: {e}")

        if all_texts:
            self.data = pd.DataFrame(all_metadata)
            embeddings = self.model.encode(all_texts, convert_to_numpy=True)
            faiss.normalize_L2(embeddings)
            
            dimension = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dimension)
            self.index.add(embeddings)
            print(f"✅ Indexed {len(all_texts)} chunks from {len(file_paths)} files.")

    def search(self, query, top_k=3):
        """Unified search that returns Answer + Source Objects."""
        if self.index is None or self.data is None or self.data.empty:
            return {"answer": "I have no documents loaded to answer from.", "sources": []}

        # 1. Vector Search
        query_vec = self.model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_vec)
        scores, indices = self.index.search(query_vec, top_k)
        
        valid_results = []
        sources = []
        
        for i in range(min(top_k, len(self.data))):
            idx = indices[0][i]
            score = float(scores[0][i])
            
            if idx != -1 and idx < len(self.data) and score > 0.35:
                row = self.data.iloc[idx]
                valid_results.append(row["answer"])
                # Formatting the source for your Next.js neon badges
                sources.append({"name": row["title"]})

        # 2. Expert Logic: Ensure the response is always a dictionary
        if not valid_results:
            return {
                "answer": "I found similar topics, but nothing with high enough confidence to answer accurately.",
                "sources": sources # Might show "close" matches even if answer is generic
            }
            
        return {
            "answer": valid_results[0], 
            "sources": sources[:3] # Limit to top 3 unique sources
        }
