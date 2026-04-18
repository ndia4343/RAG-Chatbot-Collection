'use client'

import { useState } from 'react'
import { fetchBotResponse } from '@/lib/api'
import GlassCard from '@/components/GlassCard'
import ThemeToggle from '@/components/ThemeToggle'
import AnimatedWrapper from '@/components/AnimatedWrapper'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import TypingAnimation from '@/components/TypingAnimation'
import ResultsDisplay from '@/components/ResultsDisplay'

export default function Home() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ answer: string; sources?: string[] } | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setResults(null)

    try {
      const data = await fetchBotResponse(query)
      setResults(data)
    } catch (error) {
      setResults({ 
        answer: "I couldn't reach the server. Please check if your backend is running.",
        sources: [] 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-24 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center w-full">
          <AnimatedWrapper>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 dark:from-white dark:to-gray-400">
              Amazon <span className="text-primary italic">RAG</span> Assistant
            </h1>
          </AnimatedWrapper>
          <ThemeToggle />
        </div>

        {/* Search Input Section */}
        <AnimatedWrapper>
          <GlassCard>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about Amazon products or FAQs..."
                className="flex-1 bg-transparent border-none outline-none text-lg p-2 placeholder:text-gray-500"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-[#86cc16] text-black font-bold py-2 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Thinking...' : 'Search'}
              </button>
            </form>
          </GlassCard>
        </AnimatedWrapper>

        {/* Dynamic Content Section */}
        <div className="mt-12 w-full">
          {loading && <LoadingSkeleton />}
          
          {results && (
            <ResultsDisplay 
              query={query} 
              results={results} 
              onNewSearch={() => { setResults(null); setQuery(''); }} 
            />
          )}

          {!loading && !results && (
            <div className="text-center text-gray-500 mt-20">
              <TypingAnimation text="Ask me anything about the Amazon FAQ dataset..." />
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
