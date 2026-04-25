'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { MetricGrid } from '@/components/dashboard/MetricCard'
import { API_URL } from '@/lib/config'

export default function AnalyticsPage() {

  const [liveData, setLiveData] = useState({
    total_logs: 0,
    helpful_rate: '0%'
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {

    fetch(`${API_URL}/api/stats`)
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

  // Convert "83%" → 83
  const rate = parseFloat(liveData.helpful_rate.replace('%',''))

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

  const circumference = 2 * Math.PI * 54
  const progress = circumference * (rate / 100)

  return (

    <DashboardLayout>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 text-slate-100">
          Analytics Overview
        </h1>
        <p className="text-sm text-slate-400">
          Live system performance and user insights
        </p>
      </div>

      <MetricGrid metrics={metrics} />

      {/* Charts Row */}

      <div className="grid grid-cols-2 gap-5 mb-6">

        {/* Query Volume Chart */}

        <div className="rounded-xl bg-slate-800/40 border border-[#9ef01a]/20 overflow-hidden">

          <div className="px-5 py-4 flex justify-between items-center border-b border-[#9ef01a]/10">
            <h3 className="text-sm font-semibold text-slate-100">
              Query Volume (Last 7 Days)
            </h3>
          </div>

          <div className="p-5">

            <div className="flex items-end gap-2 h-[200px]">

              {[85,92,78,95,88,91,97].map((height,i)=>(
                <div key={i} className="flex-1 flex flex-col items-center gap-1">

                  <div
                    className="w-full rounded-t-md transition hover:opacity-80"
                    style={{
                      height:`${height}%`,
                      background:'linear-gradient(to top,#9ef01a,#7acc00)'
                    }}
                  />

                  <span className="text-[10px] text-slate-500">
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}
                  </span>

                </div>
              ))}

            </div>

          </div>

        </div>


        {/* Top Queries */}

        <div className="rounded-xl bg-slate-800/40 border border-[#9ef01a]/20 overflow-hidden">

          <div className="px-5 py-4 border-b border-[#9ef01a]/10">
            <h3 className="text-sm font-semibold text-slate-100">
              Top Queries
            </h3>
          </div>

          <div className="p-5 space-y-3">

            {[
              { query:'How do I return a product?',count:1842,change:12 },
              { query:'Amazon Prime shipping',count:1523,change:8 },
              { query:'Track my order',count:1401,change:-3 },
              { query:'Cancel order',count:1288,change:15 },
              { query:'Refund status',count:1156,change:5 }
            ].map((item,i)=>(
              
              <div
                key={i}
                className="flex justify-between items-center pb-3 border-b border-[#9ef01a]/10"
              >

                <div>
                  <div className="text-sm text-slate-300">
                    {item.query}
                  </div>

                  <div className="text-xs text-slate-500">
                    {item.count.toLocaleString()} searches
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold ${
                    item.change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {item.change > 0 ? '↑' : '↓'} {Math.abs(item.change)}%
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>


      {/* Bottom Row */}

      <div className="grid grid-cols-[2fr_1fr] gap-5">

        {/* Response Time */}

        <div className="rounded-xl bg-slate-800/40 border border-[#9ef01a]/20 overflow-hidden">

          <div className="px-5 py-4 border-b border-[#9ef01a]/10">
            <h3 className="text-sm font-semibold text-slate-100">
              Response Time Distribution
            </h3>
          </div>

          <div className="p-5 space-y-4">

            {[
              { range:'< 0.2s',percentage:45,color:'#22c55e'},
              { range:'0.2s - 0.5s',percentage:38,color:'#9ef01a'},
              { range:'0.5s - 1s',percentage:12,color:'#eab308'},
              { range:'> 1s',percentage:5,color:'#ef4444'}
            ].map((item,i)=>(
              
              <div key={i}>

                <div className="flex justify-between mb-2">

                  <span className="text-sm text-slate-300">
                    {item.range}
                  </span>

                  <span
                    className="text-sm font-semibold"
                    style={{color:item.color}}
                  >
                    {item.percentage}%
                  </span>

                </div>

                <div className="h-2 rounded-full bg-slate-900 overflow-hidden">

                  <div
                    className="h-full rounded-full"
                    style={{
                      width:`${item.percentage}%`,
                      background:item.color
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* Satisfaction Score */}

        <div className="rounded-xl bg-slate-800/40 border border-[#9ef01a]/20 overflow-hidden">

          <div className="px-5 py-4 border-b border-[#9ef01a]/10">
            <h3 className="text-sm font-semibold text-slate-100">
              Satisfaction Score
            </h3>
          </div>

          <div className="p-5 flex items-center justify-center h-[200px]">

            <div className="relative w-32 h-32">

              <svg className="-rotate-90" viewBox="0 0 120 120">

                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="rgba(15,23,42,0.8)"
                  strokeWidth="8"
                />

                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#9ef01a"
                  strokeWidth="8"
                  strokeDasharray={`${progress} ${circumference}`}
                  strokeLinecap="round"
                />

              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">

                <div className="text-3xl font-bold text-[#9ef01a]">
                  {loading ? '...' : liveData.helpful_rate}
                </div>

                <div className="text-[10px] text-slate-500">
                  Satisfied
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>

  )
}
