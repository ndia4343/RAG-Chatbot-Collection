'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Database, 
  Settings, 
  BarChart3, 
  FileText 
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'FAQ Search', icon: MessageSquare, href: '/assistant' },
  { name: 'Knowledge Base', icon: Database, href: '/knowledge' },
  { name: 'Query Logs', icon: FileText, href: '/logs' },
  { name: 'Performance', icon: BarChart3, href: '/analytics' },
  { name: 'Settings', icon: Settings, href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[240px] bg-[#0d1526] border-r border-[#9ef01a]/10 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 bg-[#9ef01a] rounded-lg grid place-items-center shadow-[0_0_15px_rgba(158,240,26,0.3)]">
          <svg className="w-5 h-5 text-[#0a1a00]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3 6 6.6 1-4.8 4.6 1.2 6.8L12 17l-6 3.4 1.2-6.8L2.4 9l6.6-1z"/>
          </svg>
        </div>
        <span className="font-bold text-[#9ef01a] text-xl tracking-tight">AmzRAG</span>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 mt-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-[#9ef01a]/10 text-[#9ef01a] font-semibold border border-[#9ef01a]/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-[#9ef01a]' : ''}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/5 space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Theme</span>
          <ThemeToggle />
        </div>
        
        {/* Neutral Bot Profile */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1e293b]/40 border border-white/5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#9ef01a] to-[#7acc00] flex items-center justify-center text-[#0a1a00] font-bold text-sm shadow-lg">
            AZ
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">AmzRAG Assistant</p>
            <p className="text-[10px] text-brand-dark font-medium uppercase tracking-tighter">AI Support Service</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
