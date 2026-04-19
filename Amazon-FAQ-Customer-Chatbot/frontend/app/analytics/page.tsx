'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { MetricGrid } from '@/components/dashboard/MetricCard'

export default function AnalyticsPage() {
  // 1. Live State Management
  const [liveData, setLiveData] = useState({ total_logs: 0, helpful_rate: '0%' })
  const [loading, setLoading] = useState(true)

  // 2. Fetch data from your FastAPI backend
  useEffect(() => {
    // Note: When deploying to Hugging Face, replace this URL with your Space URL
    fetch('http://localhost:8000/api/stats')
      .then(res => res.json())
      .then(data => {
        setLiveData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to load backend stats:", err)
        setLoading(false)
      })
  }, [])

  // 3. Map Live Data to your Metric Cards
  const metrics = [
    { 
      icon: '🔍', 
      value: loading ? '...' : liveData.total_logs.toLocaleString(), 
      label: 'Total Searches', 
      change: 'Real-time sync', 
      changeType: 'up' as const 
    },
    { 
      icon: '⚡', 
      value: '0.32s', 
      label: 'Avg Response Time', 
      change: '↓ 0.08s improvement', 
      changeType: 'up' as const 
    },
    { 
      icon: '✓', 
      value: loading ? '...' : liveData.helpful_rate, 
      label: 'Satisfaction Rate', 
      change: '↑ 1.2% this week', 
      changeType: 'up' as const 
    },
    { 
      icon: '👥', 
      value: '3,421', 
      label: 'Active Users', 
      change: '↑ 24% growth', 
      changeType: 'up' as const 
    },
  ]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Analytics Overview</h1>
        <p className="text-sm" style={{ color: '#64748b' }}>Live system performance and user insights</p>
      </div>

      <MetricGrid metrics={metrics} />

      <div className="grid grid-cols-2 gap-5 mb-6">
        {/* Query Volume Chart */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(158,240,26,0.12)' }}>
          <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(158,240,26,0.08)' }}>
            <h3 className="text-[15px] font-semibold" style={{ color: '#f1f5f9' }}>Query Volume (Last 7 Days)</h3>
            <select className="px-3 py-1.5 rounded-md text-xs" style={{ background: 'rgba(158,240,26,0.08)', border: '1px solid rgba(158,240,26,0.2)', color: '#9ef01a' }}>
              <option>Last 7 days</option>
            </select>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-2 h-[200px]">
              {[85, 92, 78, 95, 88, 91, 97].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md cursor-pointer transition-all hover:opacity-80"
                    style={{ height: `${height}%`, background: 'linear-gradient(to top,#9ef01a,#7acc00)' }} />
                  <span className="text-[10px]" style={{ color: '#475569' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Queries - Merged with placeholder logic */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(158,240,26,0.12)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(158,240,26,0.08)' }}>
            <h3 className="text-[15px] font-semibold" style={{ color: '#f1f5f9' }}>Top Queries</h3>
          </div>
          <div className="p-5 space-y-3">
            {[
              { query: 'How do I return a product?', count: 1842, change: 12 },
              { query: 'Amazon Prime shipping', count: 1523, change: 8 },
              { query: 'Track my order', count: 1401, change: -3 },
              { query: 'Cancel order', count: 1288, change: 15 },
              { query: 'Refund status', count: 1156, change: 5 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between pb-3" style={{ borderBottom: i < 4 ? '1px solid rgba(158,240,26,0.06)' : 'none' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate" style={{ color: '#cbd5e1' }}>{item.query}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{item.count.toLocaleString()} searches</div>
                </div>
                <span className="text-xs font-semibold ml-3" style={{ color: item.change > 0 ? '#22c55e' : '#ef4444' }}>
                  {item.change > 0 ? '↑' : '↓'} {Math.abs(item.change)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Satisfaction Score - Now uses live data for the center percentage */}
      <div className="grid grid-cols-[2fr_1fr] gap-5">
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(158,240,26,0.12)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(158,240,26,0.08)' }}>
            <h3 className="text-[15px] font-semibold" style={{ color: '#f1f5f9' }}>Response Time Distribution</h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {[
                { range: '< 0.2s', percentage: 45, color: '#22c55e' },
                { range: '0.2s - 0.5s', percentage: 38, color: '#9ef01a' },
                { range: '0.5s - 1s', percentage: 12, color: '#eab308' },
                { range: '> 1s', percentage: 5, color: '#ef4444' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm" style={{ color: '#cbd5e1' }}>{item.range}</span>
                    <span className="text-sm font-semibold" style={{ color: item.color }}>{item.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(15,23,42,0.8)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${item.percentage}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(158,240,26,0.12)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(158,240,26,0.08)' }}>
            <h3 className="text-[15px] font-semibold" style={{ color: '#f1f5f9' }}>Satisfaction Score</h3>
          </div>
          <div className="p-5 flex flex-col items-center justify-center h-[200px]">
            <div className="relative w-32 h-32 mb-3">
              <svg className="transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(15,23,42,0.8)" strokeWidth="8" />
                <circle cx="60" cy="60" r="54" fill="none" stroke="#9ef01a" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 54 * (parseFloat(liveData.helpful_rate) / 100)} ${2 * Math.PI * 54}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: '#9ef01a' }}>
                    {loading ? '...' : liveData.helpful_rate}
                  </div>
                  <div className="text-[10px]" style={{ color: '#64748b' }}>Satisfied</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
