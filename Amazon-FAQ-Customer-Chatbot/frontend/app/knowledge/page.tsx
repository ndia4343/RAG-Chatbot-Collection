'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { FileText, RefreshCw, Trash2, Database, UploadCloud } from 'lucide-react'

const SPACE_URL = "https://aikahan-amazon-rag-bot.hf.space";

interface DatasetFile {
  name: string;
  type: 'pdf' | 'csv';
  size: string;
  lastSync: string;
}

export default function KnowledgePage() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  // 1. START WITH EMPTY STATE (No more hardcoded samples)
  const [files, setFiles] = useState<DatasetFile[]>([])

  // 2. FETCH REAL FILES ON LOAD
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch(`${SPACE_URL}/list-files`);
        if (!res.ok) throw new Error("Failed to reach server");
        const cloudFiles = await res.json();
        setFiles(cloudFiles);
      } catch (e) {
        console.error("Cloud sync failed:", e);
        setSyncStatus('error');
      }
    };
    fetchFiles();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncStatus('idle')
    try {
      const response = await fetch(`${SPACE_URL}/refresh`, { method: 'POST' })
      if (!response.ok) throw new Error("Sync failed")
      setSyncStatus('success')
      // Refresh the list after sync to get updated timestamps
      const res = await fetch(`${SPACE_URL}/list-files`);
      const updatedFiles = await res.json();
      setFiles(updatedFiles);
    } catch (err) {
      setSyncStatus('error')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${SPACE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setSyncStatus('success');
        // Refresh the list from the server to show the real file entry
        const res = await fetch(`${SPACE_URL}/list-files`);
        const cloudFiles = await res.json();
        setFiles(cloudFiles);
      }
    } catch (error) {
      setSyncStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  // 3. ADD DELETE LOGIC (Connects to the Trash Icon)
  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to remove ${fileName}? This will update the AI memory.`)) return;

    try {
      const response = await fetch(`${SPACE_URL}/delete-file/${fileName}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setFiles(prev => prev.filter(f => f.name !== fileName));
        setSyncStatus('success');
      } else {
        throw new Error();
      }
    } catch (error) {
      setSyncStatus('error');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Knowledge <span className="text-[#9ef01a]">Base</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage the documents powering your AmzRAG engine.</p>
        </div>

        <div className="flex gap-3">
          <label className={`cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 ${isUploading ? 'opacity-50' : ''}`}>
            <UploadCloud className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
            <span>{isUploading ? 'UPLOADING...' : 'LOAD DATASET'}</span>
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.csv" disabled={isUploading} />
          </label>

          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#9ef01a]/10 ${
              isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
            }`}
            style={{ background: '#9ef01a', color: '#0a1a00' }}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'SYNCING...' : 'SYNC DATABASE'}
          </button>
        </div>
      </div>

      {syncStatus !== 'idle' && (
        <div className={`mb-6 p-4 rounded-xl border flex justify-between items-center animate-in fade-in slide-in-from-top-4 ${
          syncStatus === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          <span className="text-sm font-bold uppercase tracking-wider">
            {syncStatus === 'success' ? '✅ Database Updated' : '❌ Connection Error'}
          </span>
          <button onClick={() => setSyncStatus('idle')} className="text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="glass-card overflow-hidden border border-white/5 bg-white/5 rounded-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#9ef01a]/5 border-b border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-[#9ef01a] uppercase tracking-widest">Document</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9ef01a] uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9ef01a] uppercase tracking-widest">Size</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9ef01a] uppercase tracking-widest">Last Synced</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9ef01a] uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {files.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic text-sm">
                    No documents found. Upload a file to train the AI.
                  </td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr key={file.name} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5 flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg text-[#9ef01a]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-slate-200">{file.name}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400 uppercase">
                        {file.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">{file.size}</td>
                    <td className="px-6 py-5 text-sm text-slate-400">{file.lastSync}</td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(file.name)}
                        className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-slate-500">
        <Database className="w-4 h-4" />
        <p className="text-xs italic">AmzRAG Vector Database: {files.length} active documents.</p>
      </div>
    </DashboardLayout>
  )
}
