'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  FileText,
  BarChart3,
  Settings,
  Star
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Assistant', icon: MessageSquare, href: '/assistant' },
  { name: 'Knowledge Base', icon: Database, href: '/knowledge' },
  { name: 'Logs', icon: FileText, href: '/logs' },
  { name: 'Analytics', icon: BarChart3, href: '/analytics' },
  { name: 'Settings', icon: Settings, href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href)

  return (
    <aside className="w-[260px] h-screen sticky top-0 flex flex-col border-r bg-gradient-to-b from-sky-50 to-white border-sky-100">

      {/* BRAND */}
      <div className="p-6 flex items-center gap-3 border-b border-sky-100">

        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg">
          <Star className="w-5 h-5 text-white" />
        </div>

        <div className="text-xl font-black tracking-wide text-sky-600">
          Amz<span className="text-slate-700">RAG</span>
        </div>

      </div>

      {/* NAV */}
      <nav className="flex-1 p-4 space-y-2">

        {navigation.map((item) => {
          const active = isActive(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active
                  ? 'bg-sky-100 text-sky-600 font-semibold shadow-sm'
                  : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? 'text-sky-600' : ''}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          )
        })}

      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-sky-100">

        <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-50">

          <div className="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold">
            AI
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-700">AmzRAG Assistant</p>
            <p className="text-[10px] text-sky-500 font-semibold uppercase">
              Online
            </p>
          </div>

        </div>

      </div>

    </aside>
  )
}
