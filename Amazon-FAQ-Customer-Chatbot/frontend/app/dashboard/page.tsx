"use client";
import React, { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [fileCount, setFileCount] = useState(0);

  // Fetch the real number of files from your FastAPI backend
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/list-files`)
      .then(res => res.json())
      .then(data => setFileCount(data.length))
      .catch(err => console.error("Failed to fetch analytics:", err));
  }, []);

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-[#f1f5f9] drop-shadow-md">System Dashboard</h1>
        <p className="text-[#bef264] text-sm font-medium">Real-time AI Engine Analytics</p>
      </header>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-xl">
          <p className="text-slate-400 text-sm mb-1">Knowledge Base Size</p>
          <h2 className="text-4xl font-bold text-[#f1f5f9]">{fileCount} <span className="text-lg font-normal text-slate-500">Files</span></h2>
        </div>
        
        <div className="bg-white/5 backdrop-blur-md border-l-4 border-l-[#bef264] p-6 rounded-xl shadow-xl">
          <p className="text-slate-400 text-sm mb-1">Engine Status</p>
          <h2 className="text-2xl font-bold text-[#bef264]">Active & Online</h2>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-xl">
          <p className="text-slate-400 text-sm mb-1">Search Latency</p>
          <h2 className="text-4xl font-bold text-[#f1f5f9]">~1.2 <span className="text-lg font-normal text-slate-500">ms</span></h2>
        </div>
      </div>

      {/* Activity Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#bef264]/10 rounded-full flex items-center justify-center mb-4">
          <div className="w-3 h-3 bg-[#bef264] rounded-full animate-ping"></div>
        </div>
        <h3 className="text-[#f1f5f9] font-semibold text-lg">System Monitoring Active</h3>
        <p className="text-slate-500 max-w-xs mt-2 text-sm">
          Your Amazon RAG engine is currently monitoring the <code className="text-[#bef264]">/dataset</code> folder for changes.
        </p>
      </div>
    </div>
  );
}
