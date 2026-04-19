'use client'

import Sidebar from './Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0a0f1a]">
      {/* 1. Sidebar stays fixed on the left */}
      <Sidebar />
      
      {/* 2. Page content (Analytics, Search, etc.) scrolls on the right */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
