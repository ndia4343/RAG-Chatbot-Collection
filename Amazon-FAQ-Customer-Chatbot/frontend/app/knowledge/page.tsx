'use client'

import { useState, useEffect } from 'react'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://aikahan-amazon-rag-bot.hf.space'

// ✅ Move OUTSIDE component (performance optimization)
const ALLOWED_FILES = ['pdf', 'txt', 'docx', 'csv', 'md']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

interface FileItem {
  name: string
  size: string
  type?: string
}

export default function KnowledgeBasePanel() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // -----------------------------
  // FETCH FILES
  // -----------------------------
  const fetchFiles = async () => {
    try {
      setError(null)

      const res = await fetch(`${API_URL}/list-files`)
      if (!res.ok) throw new Error('Failed to fetch')

      const data = await res.json()
      setFiles(data || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load knowledge base')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  // -----------------------------
  // UPLOAD FILE
  // -----------------------------
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()

    // ❌ File type validation
    if (!ext || !ALLOWED_FILES.includes(ext)) {
      alert('Invalid file type. Allowed: PDF, TXT, DOCX, CSV, MD')
      return
    }

    // ❌ File size validation
    if (file.size > MAX_SIZE) {
      alert('File too large. Max size is 5MB')
      return
    }

    if (uploading) return // prevent spam upload

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      await fetchFiles()
      e.target.value = ''
    } catch (err) {
      console.error(err)
      alert('Upload failed. Please check backend.')
    } finally {
      setUploading(false)
    }
  }

  // -----------------------------
  // DELETE FILE
  // -----------------------------
  const handleDelete = async (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return

    try {
      const res = await fetch(
        `${API_URL}/delete-file/${encodeURIComponent(name)}`,
        { method: 'DELETE' }
      )

      if (!res.ok) throw new Error('Delete failed')

      setFiles((prev) => prev.filter((f) => f.name !== name))
    } catch (err) {
      console.error(err)
      alert('Delete failed. Backend error.')
    }
  }

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-[#0f172a] text-white border border-white/10">
        Loading Knowledge Base...
      </div>
    )
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="p-6 rounded-2xl bg-[#0f172a] border border-white/10 space-y-5">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-white text-lg font-bold">
            Knowledge Base
          </h2>
          <p className="text-slate-500 text-xs">
            Upload documents to power your RAG AI
          </p>
        </div>

        <label className="bg-[#9ef01a] text-black px-4 py-2 rounded-lg font-bold cursor-pointer hover:scale-105 transition">
          {uploading ? 'Uploading...' : 'Upload'}

          <input
            type="file"
            hidden
            accept=".pdf,.txt,.docx,.csv,.md"
            onChange={handleUpload}
          />
        </label>
      </div>

      {/* ERROR */}
      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}

      {/* FILE LIST */}
      <div className="space-y-3">
        {files.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No documents found in knowledge base
          </p>
        ) : (
          files.map((file, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-4 rounded-xl bg-black/20 border border-white/5 hover:border-[#9ef01a]/30 transition"
            >
              <div>
                <p className="text-white text-sm font-medium">
                  {file.name}
                </p>
                <p className="text-slate-500 text-xs">
                  {file.size}
                </p>
              </div>

              <button
                onClick={() => handleDelete(file.name)}
                className="text-red-400 hover:text-red-500 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
