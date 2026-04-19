'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function QueryLogsPage() {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Replace with your actual Hugging Face logs endpoint when ready
    const fetchLogs = async () => {
      try {
        const response = await fetch('https://aikahan-amazon-rag-bot.hf.space/logs')
        const data = await response.json()
        setLogs(data)
      } catch (err) {
        console.error("Error fetching logs:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLogs()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#9ef01a]">Query Logs</h1>
        <p className="text-gray-400">Monitor real-time AI interactions and retrieval accuracy.</p>
        
        <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-[#9ef01a] text-sm uppercase">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User Query</th>
                <th className="p-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 divide-y divide-white/5">
              {logs.length > 0 ? logs.map((log: any, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 text-sm">{log.query}</td>
                  <td className="p-4"><span className="text-[#9ef01a]">{(log.confidence * 100).toFixed(0)}%</span></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-gray-500">
                    {isLoading ? "Loading logs..." : "No logs recorded yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
