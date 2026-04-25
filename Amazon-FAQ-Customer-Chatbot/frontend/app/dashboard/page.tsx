'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import KnowledgeBasePanel from '@/app/knowledge/page'
import { API_URL } from '@/lib/config'

export default function DashboardPage() {
  const [docs, setDocs] = useState(0)

  useEffect(() => {
    fetch(`${API_URL}/list-files`)
      .then((r) => r.json())
      .then((d) => setDocs(d.length))
  }, [])

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        KnowledgeRAG Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6 mb-6">

        <div className="glass-card">
          <p className="muted-text">Documents</p>
          <p className="text-3xl accent-text">{docs}</p>
        </div>

        <div className="glass-card">
          <p className="muted-text">System</p>
          <p className="text-green-400 font-bold">Online</p>
        </div>

        <div className="glass-card">
          <p className="muted-text">AI Engine</p>
          <p className="accent-text font-bold">RAG Active</p>
        </div>

      </div>

      <KnowledgeBasePanel />
    </DashboardLayout>
  )
}
