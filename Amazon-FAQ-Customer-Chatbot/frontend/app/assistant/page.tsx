'use client'

import { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

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
      content: 'Welcome back, Nadia. I am your RAG-powered assistant. Ask me anything about the Amazon FAQ dataset.',
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulation of Backend Response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Based on the retrieved documentation, Amazon Prime members receive free two-day shipping on eligible items. You can check eligibility on the product detail page.",
        confidence: 0.95,
        sources: ['Prime Shipping Policy', 'Member Benefits'],
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto">
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto mb-6 pr-4 space-y-6 scrollbar-thin scrollbar-thumb-brand/20">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-brand text-black font-medium rounded-tr-none' 
                  : 'bg-dark-card border border-dark-border text-gray-200 rounded-tl-none'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-brand/20 text-brand px-2 py-0.5 rounded border border-brand/30">
                      {msg.confidence ? Math.round(msg.confidence * 100) : 100}% MATCH
                    </span>
                  </div>
                )}
                
                <p className="text-sm leading-relaxed">{msg.content}</p>

                {msg.sources && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                    {msg.sources.map(s => (
                      <span key={s} className="text-[10px] text-brand/80 italic">#{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-dark-card border border-dark-border p-4 rounded-xl text-brand text-xs">
                AI is searching knowledge base...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form with your Gradient Button */}
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-3 bg-dark-secondary p-2 rounded-xl border border-dark-border shadow-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your FAQs..."
            className="flex-1 bg-transparent border-none text-white px-4 py-3 outline-none placeholder:text-gray-500"
          />
          
          <button 
            type="submit"
            className="bg-gradient-to-tr from-brand-dark to-brand hover:from-brand hover:to-brand-hover shadow-[0_0_15px_rgba(158,240,26,0.3)] transition-all px-8 py-3 rounded-lg text-black font-bold text-sm uppercase tracking-wide"
          >
            Search
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}
