'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MessageSquare, Database, Settings, Sun, Moon } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle' // We will create this next

const navigation = [
  { name: 'Dashboard', href: '/analytics', icon: LayoutDashboard },
  { name: 'FAQ Search', href: '/assistant', icon: MessageSquare },
  { name: 'Knowledge Base', href: '/knowledge', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] bg-[#0d1526] border-r border-[#9ef01a]/10 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 bg-[#9ef01a] rounded-lg grid place-items-center">
          <svg className="w-5 h-5 text-[#0a1a00]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3 6 6.6 1-4.8 4.6 1.2 6.8L12 17l-6 3.4 1.2-6.8L2.4 9l6.6-1z"/>
          </svg>
        </div>
        <span className="font-bold text-[#9ef01a] text-lg">AmzRAG</span>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-[#9ef01a]/10 text-[#9ef01a] font-medium' 
                  : 'text-gray-400 hover:bg-[#9ef01a]/5 hover:text-[#9ef01a]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggle Section (At the Bottom) */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Theme</span>
          <ThemeToggle />
        </div>
        
        {/* User Profile Mini-Card */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9ef01a] to-[#7acc00] flex items-center justify-center text-[#0a1a00] font-bold text-xs">
            NS
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">Nadia S.</p>
            <p className="text-[10px] text-gray-500 truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
