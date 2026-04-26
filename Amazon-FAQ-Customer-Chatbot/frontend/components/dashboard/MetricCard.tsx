'use client'

import { MetricGrid } from '@/components/dashboard/MetricCard'

export default function AnalyticsPage() {

  const metrics = [
    {
      icon: '📊',
      value: '1.2K',
      label: 'Queries',
      change: '+12%',
      changeType: 'up' as const,
    },
    {
      icon: '⚡',
      value: '89%',
      label: 'Accuracy',
      change: '+3%',
      changeType: 'up' as const,
    },
    {
      icon: '💬',
      value: '320',
      label: 'Feedbacks',
      change: '-2%',
      changeType: 'down' as const,
    },
    {
      icon: '📁',
      value: '45',
      label: 'Docs',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* FIXED COMPONENT */}
      <MetricGrid metrics={metrics} />
    </div>
  )
}
