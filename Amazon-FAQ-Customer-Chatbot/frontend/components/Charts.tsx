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
            className="w-full rounded bg-sky-500 transition-all hover:opacity-80"
            style={{ height: `${(value / max) * 100}%` }}
          />

          {labels && (
            <span className="text-xs mt-1 text-slate-500">
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
        <span className="text-slate-700">{label}</span>
        <span className="text-sky-600 font-semibold">{value}%</span>
      </div>

      <div className="h-2 bg-sky-100 rounded-full overflow-hidden">

        <div
          className="h-full bg-sky-500 transition-all"
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
        stroke="#e0f2fe"
        strokeWidth="10"
        fill="none"
      />

      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="#0ea5e9"
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
        className="fill-slate-800 text-lg font-bold"
      >
        {value}%
      </text>

    </svg>
  )
}
