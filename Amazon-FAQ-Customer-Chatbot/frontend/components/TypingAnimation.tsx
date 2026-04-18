'use client'

import { useEffect, useState } from "react"

export default function TypingAnimation({ text }: { text: string }) {

  const [displayText, setDisplayText] = useState("")
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index])
        setIndex(index + 1)
      }, 20)

      return () => clearTimeout(timeout)
    }
  }, [index, text])

  return (
    <p className="leading-relaxed whitespace-pre-line">
      {displayText}
    </p>
  )
}
