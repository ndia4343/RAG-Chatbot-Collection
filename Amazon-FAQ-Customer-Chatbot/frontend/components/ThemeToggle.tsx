'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevents hydration error
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg transition-all border border-brand/20 bg-dark-secondary hover:border-brand/50 shadow-[0_0_10px_rgba(158,240,26,0.1)]"
      title="Toggle Theme"
    >
      {theme === 'dark' ? (
        <span className="text-brand">☀️ <span className="text-[10px] ml-1 uppercase font-bold">Light</span></span>
      ) : (
        <span className="text-dark-bg font-bold text-sm">🌙 <span className="text-[10px] ml-1 uppercase">Dark</span></span>
      )}
    </button>
  )
}
