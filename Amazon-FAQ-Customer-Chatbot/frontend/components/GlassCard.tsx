'use client'

export default function GlassCard({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="
        rounded-2xl p-5
        border border-white/10
        bg-white/10 dark:bg-white/5
        backdrop-blur-xl
        shadow-lg
        transition-all
      "
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
      }}
    >
      {children}
    </div>
  )
}
