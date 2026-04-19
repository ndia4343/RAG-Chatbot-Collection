'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#1e293b] border border-[#9ef01a]/20 transition-colors focus:outline-none"
    >
      <span
        className={`${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-[#9ef01a] transition-transform flex items-center justify-center`}
      >
        {theme === 'dark' ? (
          <Moon className="w-2 h-2 text-black" />
        ) : (
          <Sun className="w-2 h-2 text-black" />
        )}
      </span>
    </button>
  )
}
