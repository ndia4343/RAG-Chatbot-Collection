import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'AmzRAG',
  description: 'AI FAQ Chatbot'
}

export default function RootLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
