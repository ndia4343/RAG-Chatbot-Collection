'use client'

import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { API_URL } from '@/lib/config'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  confidence?: number
  sources?: string[]
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Welcome to KnowledgeRAG AI. Ask anything from your knowledge base.',
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages((m) => [...m, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.content }),
      })

      const data = await res.json()

      const ai: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'No relevant information found.',
        confidence: data.confidence,
        sources: data.sources,
      }

      setMessages((m) => [...m, ai])
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'AI server unreachable.',
        },
      ])
    }

    setLoading(false)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          KnowledgeRAG Assistant
        </h1>

        <div className="flex-1 overflow-y-auto space-y-4">

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-xl ${
                  m.role === 'user'
                    ? 'bg-[#9ef01a] text-black'
                    : 'bg-white/10'
                }`}
              >
                <p>{m.content}</p>

                {m.confidence && (
                  <p className="text-xs text-[#9ef01a] mt-2">
                    Confidence {Math.round(m.confidence * 100)}%
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <p className="text-[#9ef01a] text-sm">
              Searching knowledge base...
            </p>
          )}

          <div ref={endRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-3 mt-6">

          <input
            className="flex-1 p-3 rounded bg-black/30 border border-white/10"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
          />

          <button className="bg-[#9ef01a] px-6 py-2 rounded text-black font-bold">
            Send
          </button>

        </form>
      </div>
    </DashboardLayout>
  )
}
