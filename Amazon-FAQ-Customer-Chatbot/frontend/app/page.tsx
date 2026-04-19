import Sidebar from '@/components/dashboard/Sidebar'
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // This sends the user to the Assistant page immediately
    router.push('/assistant')
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0f1a]">
      <div className="flex flex-col items-center gap-4">
        {/* Match your brand color from the mockup */}
        <div className="w-12 h-12 border-4 border-[#9ef01a] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#9ef01a] font-medium animate-pulse">Launching AmzRAG...</p>
      </div>
    </div>
  )
}
