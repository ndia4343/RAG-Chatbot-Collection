'use client'

import React from 'react'

interface Metric {
  icon: string | React.ReactNode
  value: string
  label: string
  change?: string
  changeType?: 'up' | 'down'
}

interface MetricGridProps {
  metrics: Metric[]
}

/* ---------------- CARD ---------------- */
export function MetricCard({
  icon,
  value,
  label,
  change,
  changeType,
}: Metric) {
  return (
    <div className="card">

      <div className="flex justify-between items-start mb-3">
        <div className="text-2xl">{icon}</div>

        {change && (
          <span
            className="text-xs px-2 py-1 rounded-full font-semibold"
            style={{
              background:
                changeType === 'up'
                  ? 'rgba(34,197,94,0.15)'
                  : 'rgba(239,68,68,0.1)',
              color: changeType === 'up' ? '#22c55e' : '#ef4444',
            }}
          >
            {change}
          </span>
        )}
      </div>

      <div className="text-2xl font-bold text-sky-600 mb-1">
        {value}
      </div>

      <div className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </div>

    </div>
  )
}

/* ---------------- GRID (FIXED ERROR) ---------------- */
export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {metrics.map((m, i) => (
        <MetricCard key={i} {...m} />
      ))}
    </div>
  )
}
