'use client'

import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer
}: ModalProps) {

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.4)' }}
      onClick={onClose}
    >

      <div
        className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">

          <h3 className="text-lg font-semibold text-slate-900">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="text-sky-500 hover:opacity-70 text-lg"
          >
            ✕
          </button>

        </div>

        {/* BODY */}
        <div className="p-6 text-slate-700">
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            {footer}
          </div>
        )}

      </div>

    </div>
  )
}
