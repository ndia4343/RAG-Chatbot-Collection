import pandas as pd
# ... other imports (faiss, sentence_transformers)

class AmazonRAG:
    def load_dataset(self):
        all_texts = []
        dataset_path = "dataset"
        
        if not os.path.exists(dataset_path) or not os.listdir(dataset_path):
            self.documents = []
            self.index = None
            return

        for filename in os.listdir(dataset_path):
            file_path = os.path.join(dataset_path, filename)
            
            # --- CSV LOGIC ---
            if filename.endswith('.csv'):
                df = pd.read_csv(file_path)
                
                # THE FIX: Check for common text columns
                text_columns = ['question', 'text', 'content', 'description', 'Query', 'Answer', 'product_name']
                # Find the first column that matches our list, or default to the first column in the file
                target_col = next((col for col in df.columns if col in text_columns), df.columns[0])
                
                print(f"✅ Mapping column '{target_col}' from {filename}")
                all_texts.extend(df[target_col].astype(str).tolist())

            # --- PDF LOGIC ---
            elif filename.endswith('.pdf'):
                # (Ensure pypdf is used here to extract text and append to all_texts)
                pass

        self.documents = all_texts
        
        # CRITICAL: If no text was found, don't try to index
        if not self.documents:
            print("⚠️ No text content found to index.")
            return

        # Rebuild FAISS index
        self.rebuild_index()
