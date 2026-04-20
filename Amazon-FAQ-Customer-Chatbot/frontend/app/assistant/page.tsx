'use client'

import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

// 🔗 API CONFIG (stable single source of truth)
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://aikahan-amazon-rag-bot.hf.space"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  confidence?: number
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'I am connected to your knowledge base. Ask me anything about your documents.',
    },
  ])

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ==========================
  // SEND MESSAGE (RAG CALL)
  // ==========================
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    setError(null)

    // User message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages(prev => [...prev, userMessage])

    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // ⏱ Timeout protection (IMPORTANT for HF spaces)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentInput }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`)
      }

      const data = await response.json()

      // AI response (safe parsing)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          data.answer?.trim() ||
          "I couldn't find relevant information in your knowledge base.",
        confidence: data.confidence ?? 0,
        sources: Array.isArray(data.sources)
          ? data.sources.map((s: any) =>
              typeof s === 'string' ? s : JSON.stringify(s)
            )
          : [],
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (err: any) {
      console.error("RAG ERROR:", err)

      setError("AI service temporarily unavailable")

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          err.name === 'AbortError'
            ? "Request timed out. Your AI server is slow or sleeping."
            : "System Error: Unable to connect to AI engine. Please try again.",
      }

      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  // ==========================
  // UI
  // ==========================
  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto p-4">

        {/* HEADER */}
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black text-[#f1f5f9] tracking-tight">
            AMZRAG ASSISTANT
          </h2>
          <p className="text-slate-500 text-xs uppercase tracking-widest mt-2">
            AI Knowledge Engine <span className="text-[#9ef01a]">Active</span>
          </p>
        </div>

        {/* ERROR BAR */}
        {error && (
          <div className="mb-4 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto space-y-6 mb-6">

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-[#9ef01a] text-black font-semibold'
                    : 'bg-white/5 text-white border border-white/10'
                }`}
              >

                {/* Confidence */}
                {msg.role === 'assistant' && msg.confidence ? (
                  <div className="text-[10px] text-[#9ef01a] mb-2">
                    Match: {Math.round(msg.confidence * 100)}%
                  </div>
                ) : null}

                {/* Message */}
                <p className="text-sm leading-relaxed">
                  {msg.content}
                </p>

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.sources.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-1 bg-white/10 rounded text-[#9ef01a]"
                      >
                        {s.slice(0, 40)}...
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* LOADING STATE */}
          {isLoading && (
            <div className="text-[#9ef01a] text-xs animate-pulse">
              Searching knowledge base...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BOX */}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 bg-[#0d1526] p-3 rounded-xl border border-white/10"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything from your dataset..."
            className="flex-1 bg-transparent text-white outline-none placeholder:text-slate-600"
          />

          <button
            disabled={isLoading}
            className="bg-[#9ef01a] text-black px-6 py-2 rounded-lg font-bold disabled:opacity-50"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </form>

      </div>
    </DashboardLayout>
  )
}
