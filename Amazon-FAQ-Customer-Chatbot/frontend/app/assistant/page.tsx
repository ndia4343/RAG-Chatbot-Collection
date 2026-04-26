'use client'

import { useState, useRef, useEffect } from 'react'
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
      content: 'Hi 👋 I am your KnowledgeRAG Assistant. Ask anything.'
    }
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

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.content })
      })

      const data = await res.json()

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'No answer found.',
        confidence: data.confidence,
        sources: data.sources
      }

      setMessages(prev => [...prev, botMsg])

    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Server error. Try again.'
        }
      ])
    }

    setLoading(false)
  }

  return (
    <div className="p-6 flex flex-col h-screen max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">
        AI Assistant
      </h1>

      {/* CHAT BOX */}
      <div className="flex-1 overflow-y-auto space-y-4 p-2">

        {messages.map(m => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-4 rounded-xl max-w-[70%] shadow-sm ${
                m.role === 'user'
                  ? 'bg-sky-500 text-white'
                  : 'bg-white border text-slate-800'
              }`}
            >
              <p>{m.content}</p>

              {m.confidence && (
                <p className="text-xs mt-2 text-sky-600">
                  Confidence: {Math.round(m.confidence * 100)}%
                </p>
              )}

              {m.sources && (
                <p className="text-xs text-slate-400 mt-1">
                  Sources: {m.sources.join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <p className="text-sky-500 text-sm">
            Thinking...
          </p>
        )}

        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={sendMessage} className="flex gap-3 mt-4">

        <input
          className="flex-1 border rounded-lg p-3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />

        <button
          disabled={loading}
          className="bg-sky-500 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Send
        </button>

      </form>

    </div>
  )
}
