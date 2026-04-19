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
    <div className="rounded-xl p-5 transition-all hover:translate-y-[-2px]" 
         style={{ 
           background: 'rgba(30,41,59,0.4)', 
           border: '1px solid rgba(158,240,26,0.12)',
           backdropFilter: 'blur(8px)' 
         }}>
      <div className="flex justify-between items-start mb-3">
        <div className="text-2xl">{icon}</div>
        {change && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" 
                style={{ 
                  background: changeType === 'up' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: changeType === 'up' ? '#22c55e' : '#ef4444' 
                }}>
            {change}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs uppercase tracking-wider font-medium" style={{ color: '#64748b' }}>
          {label}
        </div>
      </div>
    </div>
  )
}

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {metrics.map((metric, i) => (
        <MetricCard key={i} {...metric} />
      ))}
    </div>
  )
}
