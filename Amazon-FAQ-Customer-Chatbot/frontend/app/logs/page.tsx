'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://aikahan-amazon-rag-bot.hf.space'

export default function QueryLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setError('')
        const response = await fetch(`${API_URL}/logs`)

        if (!response.ok) throw new Error('Failed to fetch logs')

        const data = await response.json()
        setLogs(data)
      } catch (err) {
        setError('Failed to load logs from backend')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-[#9ef01a]">
            Query Logs
          </h1>
          <p className="text-gray-400 text-sm">
            Real-time AI interactions & RAG tracking
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        {/* TABLE */}
        <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">

          <table className="w-full text-left">
            <thead className="bg-white/5 text-[#9ef01a] text-sm uppercase">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User Query</th>
                <th className="p-4">Confidence</th>
              </tr>
            </thead>

            <tbody className="text-gray-300 divide-y divide-white/5">

              {/* LOADING */}
              {isLoading && (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-gray-500">
                    Loading logs...
                  </td>
                </tr>
              )}

              {/* EMPTY STATE */}
              {!isLoading && logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-gray-500">
                    No logs recorded yet
                  </td>
                </tr>
              )}

              {/* DATA */}
              {logs.map((log, i) => (
                <tr
                  key={i}
                  className="hover:bg-white/5 transition"
                >
                  <td className="p-4 text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="p-4 text-sm text-white">
                    {log.query}
                  </td>

                  <td className="p-4 text-[#9ef01a] font-bold">
                    {(log.confidence * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
