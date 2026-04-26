'use client'

import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { MetricGrid } from '@/components/dashboard/MetricCard'
import { API_URL } from '@/lib/config'

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
      label: 'Feedback',
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
    <DashboardLayout>
      <div className="p-6">

        <h1 className="text-2xl font-bold mb-6">
          Analytics
        </h1>

        <MetricGrid metrics={metrics} />

      </div>
    </DashboardLayout>
  )
}
