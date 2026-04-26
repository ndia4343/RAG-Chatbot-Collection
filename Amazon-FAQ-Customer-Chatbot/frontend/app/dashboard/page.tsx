'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/config'

export default function DashboardPage() {

  const [docs, setDocs] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/list-files`)
      .then(r => r.json())
      .then(d => {
        setDocs(d.length || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const cards = [
    {
      label: "Documents",
      value: loading ? "..." : docs,
    },
    {
      label: "System",
      value: "Online",
    },
    {
      label: "AI Engine",
      value: "RAG Active",
    },
    {
      label: "Response Time",
      value: "0.31s",
    }
  ]

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        KnowledgeRAG Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-4">

        {cards.map((c, i) => (
          <div key={i} className="card">
            <p className="text-muted text-sm">{c.label}</p>
            <p className="text-xl font-bold text-sky-600">{c.value}</p>
          </div>
        ))}

      </div>

    </div>
  )
}
