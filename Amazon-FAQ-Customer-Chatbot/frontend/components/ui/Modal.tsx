'use client'

import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      
      <div
        className={`w-full ${sizeClasses[size]} rounded-xl overflow-hidden animate-in fade-in zoom-in duration-200`}
        style={{ background: '#1e293b', border: '1px solid rgba(158,240,26,0.2)' }}
        onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(158,240,26,0.1)' }}>
          <h3 className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(158,240,26,0.08)', color: '#9ef01a' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 flex justify-end gap-3"
            style={{ borderTop: '1px solid rgba(158,240,26,0.1)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Pre-built modal variants
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'transparent', border: '1px solid rgba(158,240,26,0.25)', color: '#9ef01a' }}>
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: danger ? '#ef4444' : '#9ef01a',
              color: danger ? '#fff' : '#0a1a00',
            }}>
            {confirmText}
          </button>
        </>
      }>
      <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>
        {message}
      </p>
    </Modal>
  )
}

// Form modal example
interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  title: string
  fields: Array<{
    name: string
    label: string
    type: 'text' | 'textarea' | 'select'
    options?: string[]
    required?: boolean
  }>
}

export function FormModal({ isOpen, onClose, onSubmit, title, fields }: FormModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    onSubmit(data)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'transparent', border: '1px solid rgba(158,240,26,0.25)', color: '#9ef01a' }}>
            Cancel
          </button>
          <button
            type="submit"
            form="modal-form"
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: '#9ef01a', color: '#0a1a00' }}>
            Submit
          </button>
        </>
      }>
      <form id="modal-form" onSubmit={handleSubmit} className="space-y-4">
        {fields.map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-2" style={{ color: '#cbd5e1' }}>
              {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                required={field.required}
                className="w-full px-4 py-2.5 rounded-lg outline-none text-sm resize-none"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(158,240,26,0.15)', color: '#e2e8f0' }}
                rows={4}
              />
            ) : field.type === 'select' ? (
              <select
                name={field.name}
                required={field.required}
                className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(158,240,26,0.15)', color: '#e2e8f0' }}>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name={field.name}
                required={field.required}
                className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(158,240,26,0.15)', color: '#e2e8f0' }}
              />
            )}
          </div>
        ))}
      </form>
    </Modal>
  )
}
export default Modal;
