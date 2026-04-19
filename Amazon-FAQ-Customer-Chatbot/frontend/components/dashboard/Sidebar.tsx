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
    <aside className="w-[260px] bg-[#0d1526] border-r border-[#9ef01a]/10 flex flex-col h-screen sticky top-0 shrink-0">
      {/* BRAND HEADER - AMZRAG BRANDING */}
      <div className="p-7 flex items-center gap-4 border-b border-white/5">
        <div className="w-10 h-10 bg-[#9ef01a] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(158,240,26,0.3)] shrink-0">
          <svg className="w-6 h-6 text-[#0a1a00]" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <span className="font-black text-[#9ef01a] text-2xl tracking-[2px] uppercase">
          Amz<span className="text-white/90">RAG</span>
        </span>
      </div>
      
      {/* NAVIGATION LINKS */}
      <nav className="flex-1 p-4 space-y-1.5 mt-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#9ef01a]/10 text-[#9ef01a] font-bold border border-[#9ef01a]/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#9ef01a]' : 'group-hover:text-[#9ef01a]'}`} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* BOTTOM SECTION */}
      <div className="p-4 border-t border-white/5 space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Theme</span>
          <ThemeToggle />
        </div>
        
        {/* BOT PROFILE */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1e293b]/40 border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9ef01a] to-[#7acc00] flex items-center justify-center text-[#0a1a00] font-bold text-sm shadow-lg">
            AR
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">AmzRAG v1.0</p>
            <p className="text-[10px] text-[#9ef01a]/80 font-medium uppercase tracking-widest">System Online</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
