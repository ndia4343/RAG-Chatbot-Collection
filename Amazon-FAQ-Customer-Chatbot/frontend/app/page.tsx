'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Immediate redirect to the functional dashboard
    router.push('/assistant')
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0f1a]">
      <div className="flex flex-col items-center gap-4">
        {/* Your premium Electric Lime spinner */}
        <div className="w-12 h-12 border-4 border-[#9ef01a] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#9ef01a] font-medium animate-pulse">Launching AmzRAG...</p>
      </div>
    </div>
  )
}
