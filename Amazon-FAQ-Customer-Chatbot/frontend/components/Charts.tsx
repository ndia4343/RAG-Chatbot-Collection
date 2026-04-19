interface BarChartProps {
  data: number[]
  labels?: string[]
  height?: number
  color?: string
}

export function BarChart({ data, labels, height = 180, color = '#9ef01a' }: BarChartProps) {
  const max = Math.max(...data)
  
  return (
    <div className="flex items-end gap-1" style={{ height: `${height}px` }}>
      {data.map((value, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm cursor-pointer transition-all hover:opacity-80"
            style={{
              height: `${(value / max) * 100}%`,
              background: `linear-gradient(to top, ${color}, ${color}CC)`,
              minHeight: '20px',
            }}
          />
          {labels && labels[i] && (
            <span className="text-[10px]" style={{ color: '#475569' }}>
              {labels[i]}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

interface ProgressBarProps {
  label: string
  value: number
  color?: string
  showPercentage?: boolean
}

export function ProgressBar({ label, value, color = '#9ef01a', showPercentage = true }: ProgressBarProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm" style={{ color: '#cbd5e1' }}>{label}</span>
        {showPercentage && (
          <span className="text-sm font-semibold" style={{ color }}>
            {value}%
          </span>
        )}
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(15,23,42,0.8)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}

interface DonutChartProps {
  value: number
  size?: number
  thickness?: number
  color?: string
  label?: string
  sublabel?: string
}

export function DonutChart({ 
  value, 
  size = 120, 
  thickness = 8, 
  color = '#9ef01a',
  label,
  sublabel 
}: DonutChartProps) {
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(15,23,42,0.8)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {label && (
              <div className="text-3xl font-bold" style={{ color }}>
                {label}
              </div>
            )}
            {sublabel && (
              <div className="text-[10px]" style={{ color: '#64748b' }}>
                {sublabel}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface LineChartProps {
  data: number[]
  height?: number
  color?: string
  smooth?: boolean
}

export function LineChart({ data, height = 120, color = '#9ef01a', smooth = true }: LineChartProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 300
  const padding = 10

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding
    const y = height - ((value - min) / range) * (height - padding * 2) - padding
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="w-full">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.2 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <polygon
        points={`${padding},${height} ${points} ${width - padding},${height}`}
        fill="url(#lineGradient)"
      />
    </svg>
  )
}
