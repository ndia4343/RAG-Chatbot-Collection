'use client'

import { useState, useEffect } from 'react'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://aikahan-amazon-rag-bot.hf.space'

const ALLOWED_FILES = ['pdf', 'txt', 'docx', 'csv', 'md']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export default function KnowledgePage() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---------------- FETCH FILES ----------------
  const fetchFiles = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_URL}/list-files`)
      if (!res.ok) throw new Error('Failed to fetch')

      const data = await res.json()
      setFiles(data || [])
    } catch (err) {
      setError('Failed to load knowledge base')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  // ---------------- UPLOAD FILE ----------------
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()

    if (!ext || !ALLOWED_FILES.includes(ext)) {
      alert('Invalid file type')
      return
    }

    if (file.size > MAX_SIZE) {
      alert('File too large (max 5MB)')
      return
    }

    if (uploading) return

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
    } catch {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // ---------------- DELETE FILE ----------------
  const handleDelete = async (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return

    try {
      const res = await fetch(
        `${API_URL}/delete-file/${encodeURIComponent(name)}`,
        { method: 'DELETE' }
      )

      if (!res.ok) throw new Error('Delete failed')

      setFiles((prev) => prev.filter((f) => f.name !== name))
    } catch {
      alert('Delete failed')
    }
  }

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="p-6 text-white bg-[#0f172a] min-h-screen">
        Loading Knowledge Base...
      </div>
    )
  }

  // ---------------- UI ----------------
  return (
    <div className="p-6 space-y-6 bg-[#0f172a] min-h-screen text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Knowledge Base</h1>
          <p className="text-sm text-gray-400">
            Upload files to power your RAG AI
          </p>
        </div>

        <label className="bg-[#9ef01a] text-black px-4 py-2 rounded font-bold cursor-pointer">
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
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded">
          {error}
        </div>
      )}

      {/* FILE LIST */}
      <div className="space-y-3">
        {files.length === 0 ? (
          <p className="text-gray-400">No files uploaded yet</p>
        ) : (
          files.map((file, index) => (
            <div
              key={file.name || index}
              className="flex justify-between items-center p-4 bg-black/20 rounded border border-white/5"
            >
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-400">{file.size}</p>
              </div>

              <button
                onClick={() => handleDelete(file.name)}
                className="text-red-400 hover:text-red-500"
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
