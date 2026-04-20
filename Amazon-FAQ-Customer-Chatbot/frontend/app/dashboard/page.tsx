'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://aikahan-amazon-rag-bot.hf.space";

export default function DashboardPage() {
  const [files, setFiles] = useState<{name: string, size: string}[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch live file data from Backend
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch(`${API_URL}/list-files`);
        const data = await res.json();
        setFiles(data);
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  // 2. Logic for the "Cross" (X) button - Deletes file from session/backend
  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want the AI to forget ${fileName}?`)) return;
    
    try {
      const res = await fetch(`${API_URL}/delete-file/${fileName}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.name !== fileName));
      }
    } catch (err) {
      alert("Delete failed. Check backend connection.");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-700">
        <header>
          <h1 className="text-3xl font-black text-[#f1f5f9] tracking-tight drop-shadow-md">
            SYSTEM <span className="text-[#9ef01a]">DASHBOARD</span>
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Real-time Engine Overview</p>
        </header>

        {/* METRIC GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
            <p className="text-slate-400 text-xs uppercase font-bold mb-1">Knowledge Assets</p>
            <h2 className="text-4xl font-black text-[#f1f5f9]">{loading ? '...' : files.length}</h2>
            <div className="mt-2 text-[#9ef01a] text-[10px] font-bold uppercase">Active In Session</div>
          </div>
          
          <div className="bg-white/5 border-l-4 border-l-[#9ef01a] p-6 rounded-2xl backdrop-blur-xl">
            <p className="text-slate-400 text-xs uppercase font-bold mb-1">Engine Status</p>
            <h2 className="text-2xl font-black text-[#9ef01a]">SYNCHRONIZED</h2>
            <p className="text-[10px] text-slate-500 mt-2">Latentcy: ~0.32s</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
            <p className="text-slate-400 text-xs uppercase font-bold mb-1">AI Confidence</p>
            <h2 className="text-4xl font-black text-[#f1f5f9]">98%</h2>
            <div className="mt-2 text-slate-500 text-[10px] uppercase font-bold">Optimization: High</div>
          </div>
        </div>

        {/* ACTIVE KNOWLEDGE TABLE (The "Input Tab" with the Cross) */}
        <div className="bg-[#0d1526]/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider">Active Knowledge Sources</h3>
            <span className="text-[10px] bg-[#9ef01a]/10 text-[#9ef01a] px-2 py-1 rounded border border-[#9ef01a]/20">Live</span>
          </div>
          
          <div className="p-4">
            {files.length === 0 ? (
              <div className="py-10 text-center text-slate-600 text-sm italic">
                No files uploaded. Go to Knowledge Base to add data.
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.name} className="group flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-[#9ef01a]/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#9ef01a]/10 rounded-lg flex items-center justify-center text-[#9ef01a] text-xs font-bold">
                        {file.name.split('.').pop()?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{file.name}</p>
                        <p className="text-[10px] text-slate-500">{file.size}</p>
                      </div>
                    </div>
                    {/* THE CROSS (X) BUTTON */}
                    <button 
                      onClick={() => handleDelete(file.name)}
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-full flex items-center justify-center hover:bg-red-500/20 text-red-500 transition-all"
                      title="Delete from session"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
