'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/config'

interface FileItem {
  name: string
  size: string
}

export default function KnowledgePage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  // -----------------------------
  // FETCH FILES
  // -----------------------------
  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_URL}/list-files`)
      const data = await res.json()
      setFiles(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load files:', err)
      setFiles([])
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
  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const form = new FormData()
    form.append('file', file)

    setUploading(true)

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: form,
      })

      if (!res.ok) throw new Error('Upload failed')

      await fetchFiles()
    } catch (err) {
      alert('Upload failed ❌')
    } finally {
      setUploading(false)
    }
  }

  // -----------------------------
  // DELETE FILE
  // -----------------------------
  const deleteFile = async (name: string) => {
    try {
      const res = await fetch(`${API_URL}/delete-file/${name}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Delete failed')

      setFiles((prev) => prev.filter((f) => f.name !== name))
    } catch {
      alert('Delete failed ❌')
    }
  }

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (loading) {
    return (
      <div className="p-6 text-sky-400 font-semibold">
        Loading knowledge base...
      </div>
    )
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Knowledge Base
          </h1>
          <p className="text-sm text-slate-500">
            Upload documents to power your RAG AI
          </p>
        </div>

        <label className="bg-sky-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-sky-600 transition">
          {uploading ? 'Uploading...' : 'Upload'}

          <input
            type="file"
            hidden
            onChange={uploadFile}
          />
        </label>

      </div>

      {/* FILE LIST */}
      <div className="space-y-3">

        {files.length === 0 && (
          <p className="text-slate-400">
            No files uploaded yet
          </p>
        )}

        {files.map((f, i) => (
          <div
            key={i}
            className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10"
          >

            <div>
              <p className="font-medium text-white">{f.name}</p>
              <p className="text-sm text-slate-400">{f.size}</p>
            </div>

            <button
              onClick={() => deleteFile(f.name)}
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  )
}
