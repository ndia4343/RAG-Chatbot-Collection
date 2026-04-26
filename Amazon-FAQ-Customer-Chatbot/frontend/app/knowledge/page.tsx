'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '../../lib/config'

export default function KnowledgePage() {

  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_URL}/list-files`)
      const data = await res.json()
      setFiles(Array.isArray(data) ? data : [])
    } catch {
      setFiles([])
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const form = new FormData()
    form.append('file', file)

    setUploading(true)

    try {
      await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: form
      })

      await fetchFiles()
    } catch {
      alert('Upload failed')
    }

    setUploading(false)
  }

  const deleteFile = async (name: string) => {
    await fetch(`${API_URL}/delete-file/${name}`, {
      method: 'DELETE'
    })

    setFiles(prev => prev.filter(f => f.name !== name))
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold">
            Knowledge Base
          </h1>
          <p className="text-sm text-slate-500">
            Upload documents for AI training
          </p>
        </div>

        <label className="bg-sky-500 text-white px-4 py-2 rounded-lg cursor-pointer">
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
            No files uploaded
          </p>
        )}

        {files.map((f, i) => (
          <div
            key={i}
            className="card flex justify-between items-center"
          >

            <div>
              <p className="font-medium">{f.name}</p>
              <p className="text-sm text-slate-500">{f.size}</p>
            </div>

            <button
              onClick={() => deleteFile(f.name)}
              className="text-red-500"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  )
}
