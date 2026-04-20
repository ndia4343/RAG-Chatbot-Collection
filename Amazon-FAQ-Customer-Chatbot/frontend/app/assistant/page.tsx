'use client'

import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

// Using environment variables is safer for Vercel deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://aikahan-amazon-rag-bot.hf.space";

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
      content: 'I have successfully connected to your knowledge base. How can I assist you today?',
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
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      })

      if (!response.ok) throw new Error("Backend connection failed")

      const data = await response.json()

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || "I'm sorry, I couldn't find a matching answer in the loaded files.",
        confidence: data.confidence, 
        sources: data.sources,      
      }
      
      setMessages(prev => [...prev, aiResponse])
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "System Error: Connection to AI Engine lost. Please check if your Hugging Face Space is running.",
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto p-4">
        
        {/* HEADER: Fixes the unreadable white text issue */}
        <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h2 className="dashboard-text lime-glow text-4xl font-black tracking-tighter mb-2">
            AMZRAG ASSISTANT
          </h2>
          <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-bold">
            Agentic AI Service <span className="text-[#9ef01a]">Online</span>
          </p>
        </div>
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6 scrollbar-thin scrollbar-thumb-[#9ef01a]/20">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl p-5 shadow-2xl transition-all duration-500 ${
                  msg.role === 'user' 
                    ? 'bg-[#9ef01a] text-[#0a1a00] font-bold rounded-tr-none border-b-4 border-[#76b900]' 
                    : 'glass-card border-l-4 border-[#9ef01a] rounded-tl-none'
                }`}
              >
                {/* Confidence Badge */}
                {msg.role === 'assistant' && msg.confidence && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black bg-[#9ef01a]/10 text-[#9ef01a] px-2 py-1 rounded border border-[#9ef01a]/20 uppercase tracking-widest">
                      {Math.round(msg.confidence * 100)}% Match
                    </span>
                  </div>
                )}
                
                {/* Message Content with Readable Text Fix */}
                <p className={`text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'text-[#0a1a00]' 
                    : 'readable-text font-medium'
                }`}>
                  {msg.content}
                </p>

                {/* Sources chips */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                    {msg.sources.map(s => (
                      <span key={s} className="text-[9px] bg-white/5 px-2 py-1 rounded text-[#9ef01a] font-bold uppercase border border-white/5">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-card p-4 rounded-xl text-[#9ef01a] text-xs flex items-center gap-3 border-[#9ef01a]/30">
                <div className="w-2 h-2 bg-[#9ef01a] rounded-full animate-ping" />
                <span className="font-bold uppercase tracking-widest">Consulting Knowledge Base...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form: Premium Dark Styling */}
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-3 bg-[#0d1526] p-2 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="flex-1 bg-transparent border-none text-[#f1f5f9] px-4 py-3 outline-none placeholder:text-slate-600 font-medium"
          />
          
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-[#9ef01a] hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(158,240,26,0.3)] transition-all px-8 py-3 rounded-xl text-[#0a1a00] font-black text-sm uppercase tracking-tighter disabled:opacity-50"
          >
            {isLoading ? '...' : 'Search'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}
