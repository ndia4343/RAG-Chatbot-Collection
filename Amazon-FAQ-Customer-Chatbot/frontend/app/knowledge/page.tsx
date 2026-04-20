'use client'

import { useState, useEffect } from 'react'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://aikahan-amazon-rag-bot.hf.space'

export default function KnowledgeBasePanel() {
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // -----------------------------
  // FETCH FILES (SAFE)
  // -----------------------------
  const fetchFiles = async () => {
    try {
      setError('')
      const res = await fetch(`${API_URL}/list-files`)
      const data = await res.json()
      setFiles(data)
    } catch (err) {
      setError('Failed to load knowledge base')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  // -----------------------------
  // UPLOAD FILE (SAFE)
  // -----------------------------
  const handleUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return

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
    } catch (err) {
      alert('Upload failed. Check backend.')
    } finally {
      setUploading(false)
    }
  }

  // -----------------------------
  // DELETE FILE (SAFE)
  // -----------------------------
  const handleDelete = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return

    try {
      const res = await fetch(
        `${API_URL}/delete-file/${encodeURIComponent(name)}`,
        { method: 'DELETE' }
      )

      if (!res.ok) throw new Error('Delete failed')

      setFiles((prev) => prev.filter((f) => f.name !== name))
    } catch (err) {
      alert('Delete failed. Backend error.')
    }
  }

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (loading) {
    return (
      <div className="p-6 bg-[#111827] rounded-2xl text-white">
        Loading knowledge base...
      </div>
    )
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="p-6 bg-[#111827] rounded-2xl border border-white/10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-white font-bold text-lg">
          Knowledge Base
        </h2>

        <label className="bg-[#9ef01a] text-black px-4 py-2 rounded-lg font-bold cursor-pointer hover:scale-105 transition">
          {uploading ? 'Uploading...' : 'Upload File'}
          <input type="file" hidden onChange={handleUpload} />
        </label>
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-red-400 text-sm mb-3">{error}</p>
      )}

      {/* FILE LIST */}
      <div className="space-y-3">
        {files.length === 0 && (
          <p className="text-slate-500 text-sm">
            No documents uploaded
          </p>
        )}

        {files.map((file, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5"
          >
            <div>
              <p className="text-white text-sm">{file.name}</p>
              <p className="text-slate-500 text-xs">{file.size}</p>
            </div>

            <button
              onClick={() => handleDelete(file.name)}
              className="text-red-400 text-sm hover:text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
