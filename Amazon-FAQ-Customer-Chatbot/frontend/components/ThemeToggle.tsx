'use client'

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="
        px-4 py-2 rounded-xl text-sm font-medium
        border border-[#9ef01a]
        bg-white dark:bg-[#0b1220]
        text-black dark:text-white
        transition-all duration-300
        hover:scale-105
      "
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  )
}
