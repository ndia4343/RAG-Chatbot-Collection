'use client'

interface BarChartProps {
  data: number[]
  labels?: string[]
}

export function BarChart({ data, labels }: BarChartProps) {

  const max = Math.max(...data, 1)

  return (
    <div className="flex items-end gap-2 h-40">

      {data.map((value, i) => (
        <div key={i} className="flex flex-col items-center flex-1">

          <div
            className="w-full rounded bg-brand transition-all hover:opacity-80"
            style={{ height: `${(value / max) * 100}%` }}
          />

          {labels && (
            <span className="text-xs mt-1 text-gray-400">
              {labels[i]}
            </span>
          )}

        </div>
      ))}

    </div>
  )
}

export function ProgressBar({
  label,
  value
}: {
  label: string
  value: number
}) {
  return (
    <div>

      <div className="flex justify-between text-sm mb-2">
        <span>{label}</span>
        <span className="text-brand">{value}%</span>
      </div>

      <div className="h-2 bg-dark-secondary rounded-full overflow-hidden">

        <div
          className="h-full bg-brand transition-all"
          style={{ width: `${value}%` }}
        />

      </div>

    </div>
  )
}

export function DonutChart({
  value
}: {
  value: number
}) {

  const radius = 50
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width="120" height="120">

      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="#1e293b"
        strokeWidth="10"
        fill="none"
      />

      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="#9ef01a"
        strokeWidth="10"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
      />

      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-white text-lg font-bold"
      >
        {value}%
      </text>

    </svg>
  )
}
