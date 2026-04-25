'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {

  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const current = theme === 'system'
    ? resolvedTheme
    : theme

  return (
    <button
      onClick={() =>
        setTheme(current === 'dark' ? 'light' : 'dark')
      }
      className="flex items-center gap-2 px-3 py-1 border border-dark-border rounded-lg"
    >

      {current === 'dark'
        ? <Moon className="w-4 h-4 text-brand" />
        : <Sun className="w-4 h-4 text-brand" />
      }

      <span className="text-sm">
        {current === 'dark' ? 'Dark' : 'Light'}
      </span>

    </button>
  )
}
