'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-dark-bg text-white">

      {/* Sidebar (FIXED: NO PROPS) */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-dark-secondary sticky top-0 z-40">

          {/* Mobile menu button (kept for UI, but no sidebar toggle logic anymore) */}
          <button className="lg:hidden">
            <Menu className="w-6 h-6 text-brand" />
          </button>

          <h1 className="text-lg font-semibold">
            AmzRAG Dashboard
          </h1>

          <ThemeToggle />

        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  )
}
