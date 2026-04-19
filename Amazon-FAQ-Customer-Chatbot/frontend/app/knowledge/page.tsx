'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { FileText, RefreshCw, Trash2, Database } from 'lucide-react'

// Replace with your actual Hugging Face Space URL
const REFRESH_API_URL = "https://aikahan-amazon-rag-bot.hf.space/refresh";

interface DatasetFile {
  name: string;
  type: 'pdf' | 'csv';
  size: string;
  lastSync: string;
}

export default function KnowledgePage() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  // In a real app, you'd fetch this from your backend. For now, we list your current files.
  const [files, setFiles] = useState<DatasetFile[]>([
    { name: 'amazon_faqs.csv', type: 'csv', size: '1.2 MB', lastSync: '2026-04-19' },
    { name: 'shipping_policy.pdf', type: 'pdf', size: '450 KB', lastSync: '2026-04-20' },
  ])

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncStatus('idle')
    
    try {
      const response = await fetch(REFRESH_API_URL, { method: 'POST' })
      if (!response.ok) throw new Error("Sync failed")
      
      setSyncStatus('success')
      // Update the "Last Sync" date for all files
      setFiles(files.map(f => ({ ...f, lastSync: new Date().toISOString().split('T')[0] })))
    } catch (err) {
      setSyncStatus('error')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white light:text-slate-900 tracking-tight uppercase">
            Knowledge <span className="text-[#9ef01a]">Base</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage the documents powering your AmzRAG engine.</p>
        </div>

        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
            isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
          }`}
          style={{ background: '#9ef01a', color: '#0a1a00' }}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'SYNCING...' : 'SYNC KNOWLEDGE BASE'}
        </button>
      </div>

      {/* SYNC STATUS TOAST */}
      {syncStatus !== 'idle' && (
        <div className={`mb-6 p-4 rounded-xl border flex justify-between items-center ${
          syncStatus === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          <span className="text-sm font-bold uppercase tracking-wider">
            {syncStatus === 'success' ? '✅ Database Updated Successfully' : '❌ Sync Failed. Check Space Logs.'}
          </span>
          <button onClick={() => setSyncStatus('idle')} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {/* FILES TABLE */}
      <div className="glass-card overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#9ef01a]/5 border-b border-white/5">
              <th className="px-6 py-4 text-xs font-bold text-[#9ef01a] uppercase tracking-widest">Document</th>
              <th className="px-6 py-4 text-xs font-bold text-[#9ef01a] uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-[#9ef01a] uppercase tracking-widest">Size</th>
              <th className="px-6 py-4 text-xs font-bold text-[#9ef01a] uppercase tracking-widest">Last Synced</th>
              <th className="px-6 py-4 text-xs font-bold text-[#9ef01a] uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {files.map((file) => (
              <tr key={file.name} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-5 flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-[#9ef01a]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-200 light:text-slate-700">{file.name}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400 uppercase">
                    {file.type}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-slate-500 italic">{file.size}</td>
                <td className="px-6 py-5 text-sm text-slate-400">{file.lastSync}</td>
                <td className="px-6 py-5">
                  <button className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER INFO */}
      <div className="mt-6 flex items-center gap-2 text-slate-500">
        <Database className="w-4 h-4" />
        <p className="text-xs italic">AmzRAG Vector Database: 1,402 entries indexed across all documents.</p>
      </div>
    </DashboardLayout>
  )
}
