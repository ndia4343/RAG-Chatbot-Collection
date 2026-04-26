'use client'

import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#f7fbff] text-slate-900">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white">

          <button className="lg:hidden">
            <Menu className="w-6 h-6 text-sky-500" />
          </button>

          <h1 className="text-lg font-semibold">
            AmzRAG Dashboard
          </h1>

        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  )
}
