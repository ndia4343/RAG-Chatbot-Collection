'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-8 h-4" /> 

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-10 h-5 rounded-full bg-[#1e293b] border border-[#9ef01a]/20 transition-all duration-300 hover:border-[#9ef01a]/50"
    >
      <div
        className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full transition-all duration-300 flex items-center justify-center ${
          theme === 'dark' 
            ? 'translate-x-5 bg-[#9ef01a] shadow-[0_0_8px_#9ef01a]' 
            : 'translate-x-0 bg-slate-400'
        }`}
      >
        {theme === 'dark' ? (
          <Moon className="w-2 h-2 text-[#0a1a00]" />
        ) : (
          <Sun className="w-2 h-2 text-white" />
        )}
      </div>
    </button>
  )
}
