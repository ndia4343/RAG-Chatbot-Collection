'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  Settings,
  BarChart3,
  FileText,
  Star
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'FAQ Search', icon: MessageSquare, href: '/assistant' },
  { name: 'Knowledge Base', icon: Database, href: '/knowledge' },
  { name: 'Query Logs', icon: FileText, href: '/logs' },
  { name: 'Performance', icon: BarChart3, href: '/analytics' },
  { name: 'Settings', icon: Settings, href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href)

  return (
    <aside className="w-[260px] bg-[#0d1526] border-r border-white/10 flex flex-col h-screen sticky top-0">

      {/* BRAND */}
      <div className="p-7 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 bg-[#9ef01a] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(158,240,26,0.4)]">
          <Star className="w-6 h-6 text-[#0a1a00]" />
        </div>

        <span className="font-black text-[#9ef01a] text-2xl tracking-[2px] uppercase">
          Amz<span className="text-white">RAG</span>
        </span>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {navigation.map((item) => {
          const active = isActive(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-[#9ef01a]/10 text-[#9ef01a] border border-[#9ef01a]/20 font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? 'text-[#9ef01a]' : ''}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/5 space-y-4">

        {/* THEME */}
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Theme
          </span>
          <ThemeToggle />
        </div>

        {/* BOT STATUS */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111827] border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9ef01a] to-[#7acc00] flex items-center justify-center text-black font-bold">
            AR
          </div>

          <div>
            <p className="text-xs font-semibold text-white">AmzRAG Assistant</p>
            <p className="text-[10px] text-[#9ef01a] uppercase tracking-widest">
              Online
            </p>
          </div>
        </div>

      </div>
    </aside>
  )
}
