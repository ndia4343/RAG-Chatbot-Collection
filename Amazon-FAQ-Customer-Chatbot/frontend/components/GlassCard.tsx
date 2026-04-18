'use client'

import React, { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string // This allows the component to accept extra styles
}

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`
        rounded-2xl p-5
        border border-white/10
        bg-white/10 dark:bg-white/5
        backdrop-blur-xl
        shadow-lg
        transition-all
        ${className} 
      `}
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
      }}
    >
      {children}
    </div>
  )
}
