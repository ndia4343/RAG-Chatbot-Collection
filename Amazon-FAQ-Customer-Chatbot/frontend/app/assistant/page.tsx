'use client'

import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

// REPLACE THIS with your actual Hugging Face Space URL
const HUGGINGFACE_API_URL = "https://your-name-space.hf.space/query";

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
      content: 'Welcome to the AmzRAG Assistant. I am ready to help you with the Amazon FAQ dataset.',
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

      const data = await response.json()

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || "I'm sorry, I couldn't find an answer in the FAQ dataset.",
        confidence: data.confidence || 0.85,
        sources: data.sources || ['Amazon FAQ CSV'],
      }
      
      setMessages(prev => [...prev, aiResponse])
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Error: Could not connect to the knowledge base. Please check if the Hugging Face Space is running.",
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  // ... (Rest of your JSX code remains the same)
