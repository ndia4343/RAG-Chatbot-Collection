'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const currentTheme = theme === 'system' ? resolvedTheme : theme

  return (
    <button
      onClick={() =>
        setTheme(currentTheme === 'dark' ? 'light' : 'dark')
      }
      className="
        relative inline-flex h-6 w-11 items-center rounded-full
        bg-[#0f172a] border border-[#9ef01a]/20
        transition-all duration-300
        focus:outline-none
      "
    >
      {/* Toggle Knob */}
      <span
        className={`
          inline-flex items-center justify-center
          h-4 w-4 transform rounded-full
          bg-[#9ef01a]
          transition-transform duration-300
          ${currentTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'}
        `}
      >
        {currentTheme === 'dark' ? (
          <Moon className="w-2 h-2 text-black" />
        ) : (
          <Sun className="w-2 h-2 text-black" />
        )}
      </span>
    </button>
  )
}
