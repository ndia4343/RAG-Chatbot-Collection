'use client'

import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const HUGGINGFACE_API_URL = "https://aikahan-amazon-rag-bot.hf.space/query";

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
      content: 'Welcome to the AmzRAG Assistant. I am ready to help you with your knowledge base (PDF/CSV).',
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
      const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      })

      if (!response.ok) throw new Error("Backend connection failed")

      // --- MAPPING LOGIC START ---
      const data = await response.json()

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || "I'm sorry, I couldn't find a matching answer.",
        confidence: data.confidence, 
        sources: data.sources,      
      }
      // --- MAPPING LOGIC END ---
      
      setMessages(prev => [...prev, aiResponse])
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Error: Could not connect to AmzRAG Engine. Please ensure your Hugging Face Space is active.",
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto p-4">
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6 scrollbar-thin">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl p-5 shadow-lg transition-all duration-500 ${
                  msg.role === 'user' 
                    ? 'bg-[#9ef01a] text-[#0a1a00] font-semibold rounded-tr-none' 
                    : 'glass-card border-l-4 border-[#9ef01a] rounded-tl-none'
                }`}
              >
                {/* Assistant Label & Confidence Score */}
                {msg.role === 'assistant' && msg.confidence && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold bg-[#9ef01a]/20 text-[#9ef01a] px-2 py-0.5 rounded border border-[#9ef01a]/30 uppercase tracking-widest">
                      {Math.round(msg.confidence * 100)}% Match Confidence
                    </span>
                  </div>
                )}
                
                {/* Message Content */}
                <p className={`text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'text-[#0a1a00]' 
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-800'
                }`}>
                  {msg.content}
                </p>

                {/* Sources Section */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                    {msg.sources.map(s => (
                      <span key
