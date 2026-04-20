'use client'

import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://aikahan-amazon-rag-bot.hf.space";

export default function KnowledgeInputTab() {
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 1. LOAD DATASET: Keep files loaded in the tab on refresh/navigation
  useEffect(() => {
    const syncFiles = async () => {
      try {
        const res = await fetch(`${API_URL}/list-files`);
        const data = await res.json();
        setUploadedFiles(data); // This keeps the list present
      } catch (err) {
        console.error("Sync error:", err);
      }
    };
    syncFiles();
  }, []);

  // 2. THE CROSS (✕) LOGIC: Manual removal
  const removeFile = async (fileName: string) => {
    try {
      const res = await fetch(`${API_URL}/delete-file/${fileName}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // Remove from UI immediately
        setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="glass-card p-6 border border-[#9ef01a]/10 rounded-2xl">
      <h3 className="text-[#f1f5f9] font-bold text-sm uppercase tracking-widest mb-4">
        Active Knowledge Base
      </h3>

      {/* INPUT TAB AREA */}
      <div className="space-y-3">
        {uploadedFiles.length === 0 ? (
          <div className="border-2 border-dashed border-white/5 rounded-xl py-10 text-center text-slate-500 text-sm">
            No datasets loaded. Upload a file to begin.
          </div>
        ) : (
          uploadedFiles.map((file) => (
            <div 
              key={file.name} 
              className="flex items-center justify-between bg-[#0d1526] border border-white/5 p-4 rounded-xl group hover:border-[#9ef01a]/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#9ef01a] rounded-full animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">{file.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{file.size}</p>
                </div>
              </div>

              {/* THE CROSS BUTTON */}
              <button 
                onClick={() => removeFile(file.name)}
                className="text-slate-500 hover:text-red-500 transition-colors p-2"
                title="Remove file from engine"
              >
                <span className="text-lg font-bold">✕</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* UPLOAD TRIGGER (Optional placeholder) */}
      <div className="mt-6">
        <label className="block w-full py-3 bg-[#9ef01a] text-[#0a1a00] text-center rounded-xl font-black text-xs uppercase tracking-tighter cursor-pointer hover:bg-[#bef264] transition-all">
          + Add New Dataset
          <input type="file" className="hidden" onChange={(e) => {/* Handle Upload Logic */}} />
        </label>
      </div>
    </div>
  )
}
