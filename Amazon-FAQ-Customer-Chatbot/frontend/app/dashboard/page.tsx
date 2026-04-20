'use client'

import { useEffect, useState } from 'react'
import KnowledgeBasePanel from '@/components/KnowledgeBasePanel'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://aikahan-amazon-rag-bot.hf.space"

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch(`${API_URL}/list-files`)
      .then(res => res.json())
      .then(data => {
        setStats({
          files: data.length
        })
      })
  }, [])

  return (
    <div className="p-6 space-y-6 bg-[#0a0f1c] min-h-screen">

      {/* HEADER */}
      <h1 className="text-2xl font-black text-white">
        AI SaaS Dashboard
      </h1>

      {/* METRICS */}
      <div className="grid grid-cols-3 gap-4">

        <div className="bg-[#111827] p-4 rounded-xl border border-white/10">
          <p className="text-slate-400 text-xs">Documents</p>
          <p className="text-2xl text-[#9ef01a] font-bold">
            {stats?.files ?? 0}
          </p>
        </div>

        <div className="bg-[#111827] p-4 rounded-xl border border-white/10">
          <p className="text-slate-400 text-xs">System</p>
          <p className="text-green-400 font-bold">Active</p>
        </div>

        <div className="bg-[#111827] p-4 rounded-xl border border-white/10">
          <p className="text-slate-400 text-xs">AI Mode</p>
          <p className="text-white font-bold">RAG Enabled</p>
        </div>

      </div>

      {/* KNOWLEDGE BASE */}
      <KnowledgeBasePanel />

    </div>
  )
}
