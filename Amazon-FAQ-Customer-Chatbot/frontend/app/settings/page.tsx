'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://aikahan-amazon-rag-bot.hf.space'

interface SettingsState {
  model: string
  temperature: number
  maxTokens: number
  topK: number
  confidence: number
  autoRetrain: boolean
  emailNotifications: boolean
  slackIntegration: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // -----------------------------
  // LOAD SETTINGS FROM BACKEND
  // -----------------------------
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`)
        const data = await res.json()
        setSettings(data)
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // -----------------------------
  // SAVE SETTINGS TO BACKEND
  // -----------------------------
  const saveSettings = async () => {
    if (!settings) return

    setSaving(true)

    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!res.ok) throw new Error('Save failed')

      alert('Settings saved successfully 🚀')
    } catch (err) {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (loading || !settings) {
    return (
      <DashboardLayout>
        <div className="p-8 text-[#9ef01a] font-bold">
          Loading settings...
        </div>
      </DashboardLayout>
    )
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Settings</h1>
        <p className="text-sm text-slate-500">
          Control your AI engine behavior (Live SaaS Mode)
        </p>
      </div>

      <div className="max-w-3xl space-y-6">

        {/* MODEL */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
          <h3 className="text-[#f1f5f9] font-semibold mb-3">Model</h3>

          <select
            value={settings.model}
            onChange={(e) =>
              setSettings({ ...settings, model: e.target.value })
            }
            className="w-full p-3 rounded-lg bg-[#0d1526] text-white border border-white/10"
          >
            <option value="mistral-7b">Mistral 7B</option>
            <option value="llama-3">Llama 3</option>
            <option value="gpt-3.5">GPT-3.5</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>

        {/* SLIDERS */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-5">

          <Slider
            label="Temperature"
            value={settings.temperature}
            min={0}
            max={1}
            step={0.1}
            onChange={(v) => setSettings({ ...settings, temperature: v })}
          />

          <Slider
            label="Max Tokens"
            value={settings.maxTokens}
            min={100}
            max={2000}
            step={100}
            onChange={(v) => setSettings({ ...settings, maxTokens: v })}
          />

          <Slider
            label="Top K"
            value={settings.topK}
            min={1}
            max={10}
            step={1}
            onChange={(v) => setSettings({ ...settings, topK: v })}
          />

          <Slider
            label="Confidence"
            value={settings.confidence}
            min={0}
            max={1}
            step={0.1}
            onChange={(v) => setSettings({ ...settings, confidence: v })}
          />
        </div>

        {/* TOGGLES */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-4">

          <Toggle
            label="Auto Retrain"
            value={settings.autoRetrain}
            onChange={(v) =>
              setSettings({ ...settings, autoRetrain: v })
            }
          />

          <Toggle
            label="Email Notifications"
            value={settings.emailNotifications}
            onChange={(v) =>
              setSettings({ ...settings, emailNotifications: v })
            }
          />

          <Toggle
            label="Slack Integration"
            value={settings.slackIntegration}
            onChange={(v) =>
              setSettings({ ...settings, slackIntegration: v })
            }
          />
        </div>

        {/* SAVE BUTTON (REAL SAAS FIX) */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-3 rounded-lg font-bold bg-[#9ef01a] text-black hover:scale-105 transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}

/* -----------------------------
   COMPONENTS
------------------------------ */

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: any) {
  return (
    <div>
      <div className="flex justify-between text-sm text-slate-300 mb-2">
        <span>{label}</span>
        <span className="text-[#9ef01a] font-bold">{value}</span>
      </div>

      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  )
}

function Toggle({ label, value, onChange }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-300 text-sm">{label}</span>

      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition ${
          value ? 'bg-[#9ef01a]' : 'bg-gray-600'
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full transition transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
