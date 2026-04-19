'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  views: number
  helpful: number
  lastUpdated: string
}

const SAMPLE_FAQS: FAQ[] = [
  { id: '1', question: 'How do I return a product?', answer: 'You can return most items within 30 days...', category: 'Returns', views: 1842, helpful: 95, lastUpdated: '2024-04-15' },
  { id: '2', question: 'What is Amazon Prime?', answer: 'Amazon Prime is a membership program...', category: 'Prime', views: 1523, helpful: 98, lastUpdated: '2024-04-14' },
  { id: '3', question: 'How to track my order?', answer: 'Go to Your Orders and click Track Package...', category: 'Orders', views: 1401, helpful: 92, lastUpdated: '2024-04-13' },
];

export default function KnowledgePage() {
  // 1. We use setFaqs so the list can change when we delete something
  const [faqs, setFaqs] = useState(SAMPLE_FAQS)

  // 2. This function filters out the ID we want to remove
  const deleteFaq = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Knowledge Base</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>Manage and edit your FAQ library</p>
        </div>
        <button className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#9ef01a', color: '#0a1a00' }}>
          + Add FAQ
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(158,240,26,0.12)' }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ background: 'rgba(158,240,26,0.05)' }}>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ef01a' }}>Question</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ef01a' }}>Category</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ef01a' }}>Views</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ef01a' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(158,240,26,0.05)]">
            {faqs.map((faq) => (
              <tr key={faq.id} className="hover:bg-[rgba(158,240,26,0.02)] transition-colors">
                <td className="px-5 py-4 text-sm" style={{ color: '#cbd5e1' }}>{faq.question}</td>
                <td className="px-5 py-4 text-sm">
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold" style={{ background: 'rgba(158,240,26,0.1)', color: '#9ef01a' }}>
                    {faq.category}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm" style={{ color: '#64748b' }}>{faq.views.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm">
                   <button className="text-[#9ef01a] hover:underline mr-3">Edit</button>
                   {/* 3. The button now triggers the deleteFaq function */}
                   <button 
                     onClick={() => deleteFaq(faq.id)} 
                     className="text-red-400 hover:underline"
                   >
                     Delete
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
