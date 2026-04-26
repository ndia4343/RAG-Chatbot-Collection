'use client'

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

export function MetricCard({ icon, value, label, change, changeType }: Metric) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5 hover:shadow-md transition">

      {/* TOP */}
      <div className="flex justify-between items-start mb-3">

        <div className="text-2xl">{icon}</div>

        {change && (
          <span
            className="text-xs px-2 py-1 rounded-full font-semibold"
            style={{
              background:
                changeType === 'up'
                  ? 'rgba(14,165,233,0.12)'
                  : 'rgba(239,68,68,0.1)',
              color:
                changeType === 'up' ? '#0284c7' : '#ef4444'
            }}
          >
            {change}
          </span>
        )}

      </div>

      {/* VALUE */}
      <div className="text-3xl font-bold text-sky-600 mb-1">
        {value}
      </div>

      {/* LABEL */}
      <div className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </div>

    </div>
  )
}

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {metrics.map((m, i) => (
        <MetricCard key={i} {...m} />
      ))}
    </div>
  )
}
