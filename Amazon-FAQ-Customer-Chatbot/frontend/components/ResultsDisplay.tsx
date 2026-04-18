'use client'

import React from 'react'
import GlassCard from './GlassCard'
import AnimatedWrapper from './AnimatedWrapper'

interface Source {
  id: string
  title: string
  short_answer?: string
  answer?: string
  relevance?: number
}

interface ResultsDisplayProps {
  data: {
    answer: string
    sources: Source[]
    processing_time_ms?: number
  } | null
  isLoading: boolean
  query?: string 
}

const ResultsDisplay = ({ data, isLoading, query }: ResultsDisplayProps) => {
  if (isLoading) {
    return (
      <AnimatedWrapper>
        <GlassCard className="p-6 mt-4 animate-pulse">
          <div className="h-4 bg-white/20 rounded w-1/3 mb-4" />
          <div className="h-3 bg-white/10 rounded w-full mb-2" />
          <div className="h-3 bg-white/10 rounded w-5/6 mb-2" />
          <div className="h-3 bg-white/10 rounded w-2/3" />
        </GlassCard>
      </AnimatedWrapper>
    )
  }

  if (!data) {
    return (
      <AnimatedWrapper>
        <GlassCard className="p-6 mt-4 text-center text-gray-400">
          Ask a question to see AI analysis results
        </GlassCard>
      </AnimatedWrapper>
    )
  }

  return (
    <AnimatedWrapper>
      <GlassCard className="p-6 mt-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">AI Analysis Result</h3>
            {query && <p className="text-xs text-gray-400 italic">Query: "{query}"</p>}
          </div>

          {data.processing_time_ms && (
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
              {data.processing_time_ms} ms
            </span>
          )}
        </div>

        {/* Answer */}
        <div className="text-gray-200 leading-relaxed text-sm md:text-base">
          {data.answer}
        </div>

        {/* Sources */}
        {data.sources && data.sources.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Sources</h4>
            <div className="flex flex-wrap gap-2">
              {data.sources.map((src, i) => (
                <div
                  key={i}
                  className="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/10"
                >
                  {src.title} {src.relevance ? `(${Math.round(src.relevance * 100)}%)` : ''}
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </AnimatedWrapper>
  )
}

export default ResultsDisplay
