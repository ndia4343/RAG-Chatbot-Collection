'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    apiKey: 'hf_••••••••••••••••',
    model: 'mistral-7b',
    temperature: 0.7,
    maxTokens: 1000,
    topK: 5,
    confidence: 0.6,
    autoRetrain: true,
    emailNotifications: true,
    slackIntegration: false,
  })

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Settings</h1>
        <p className="text-sm" style={{ color: '#64748b' }}>Configure system preferences and integrations</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* API Configuration */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(158,240,26,0.12)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(158,240,26,0.08)' }}>
            <h3 className="text-[15px] font-semibold" style={{ color: '#f1f5f9' }}>API Configuration</h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#cbd5e1' }}>HuggingFace API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={settings.apiKey}
                  className="flex-1 px-4 py-2.5 rounded-lg outline-none text-sm"
                  style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(158,240,26,0.15)', color: '#e2e8f0' }}
                  readOnly
                />
                <button className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ background: 'rgba(158,240,26,0.1)', border: '1px solid rgba(158,240,26,0.25)', color: '#9ef01a' }}>
                  Update
                </button>
              </div>
              <p className="text-xs mt-1.5" style={{ color: '#64748b' }}>Used for embeddings and answer generation</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#cbd5e1' }}>Model</label>
              <select
                value={settings.model}
                onChange={e => setSettings({ ...settings, model: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(158,240,26,0.15)', color: '#e2e8f0' }}>
                <option value="mistral-7b">Mistral 7B Instruct</option>
                <option value="llama-2-7b">Llama 2 7B</option>
                <option value="gpt-3.5">GPT-3.5 Turbo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Model Parameters */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(158,240,26,0.12)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(158,240,26,0.08)' }}>
            <h3 className="text-[15px] font-semibold" style={{ color: '#f1f5f9' }}>Model Parameters</h3>
          </div>
          <div className="p-5 space-y-5">
            {[
              { label: 'Temperature', value: settings.temperature, min: 0, max: 1, step: 0.1, key: 'temperature' },
              { label: 'Max Tokens', value: settings.maxTokens, min: 100, max: 2000, step: 100, key: 'maxTokens' },
              { label: 'Top K Results', value: settings.topK, min: 1, max: 10, step: 1, key: 'topK' },
              { label: 'Min Confidence', value: settings.confidence, min: 0, max: 1, step: 0.1, key: 'confidence' },
            ].map(param => (
              <div key={param.key}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium" style={{ color: '#cbd5e1' }}>{param.label}</label>
                  <span className="text-sm font-semibold" style={{ color: '#9ef01a' }}>{param.value}</span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={param.value}
                  onChange={e => setSettings({ ...settings, [param.key]: parseFloat(e.target.value) })}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #9ef01a ${((param.value - param.min) / (param.max - param.min)) * 100}%, rgba(15,23,42,0.8) 0%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* System Preferences */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(158,240,26,0.12)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(158,240,26,0.08)' }}>
            <h3 className="text-[15px] font-semibold" style={{ color: '#f1f5f9' }}>System Preferences</h3>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'Auto-Retrain Model', desc: 'Automatically retrain with user feedback', key: 'autoRetrain' },
              { label: 'Email Notifications', desc: 'Receive alerts for system events', key: 'emailNotifications' },
              { label: 'Slack Integration', desc: 'Send notifications to Slack', key: 'slackIntegration' },
            ].map(pref => (
              <div key={pref.key} className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(158,240,26,0.06)' }}>
                <div>
                  <div className="text-sm font-medium mb-0.5" style={{ color: '#cbd5e1' }}>{pref.label}</div>
                  <div className="text-xs" style={{ color: '#64748b' }}>{pref.desc}</div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, [pref.key]: !settings[pref.key as keyof typeof settings] })}
                  className="relative w-11 h-6 rounded-full transition-colors"
                  style={{ background: settings[pref.key as keyof typeof settings] ? '#9ef01a' : 'rgba(71,85,105,0.5)' }}>
                  <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ transform: settings[pref.key as keyof typeof settings] ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
            <h3 className="text-[15px] font-semibold" style={{ color: '#ef4444' }}>Danger Zone</h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium mb-0.5" style={{ color: '#fca5a5' }}>Clear All Data</div>
                <div className="text-xs" style={{ color: '#dc2626' }}>Delete all FAQs, queries, and feedback</div>
              </div>
              <button className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
                Clear Data
              </button>
            </div>
            <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(239,68,68,0.2)' }}>
              <div>
                <div className="text-sm font-medium mb-0.5" style={{ color: '#fca5a5' }}>Reset Model</div>
                <div className="text-xs" style={{ color: '#dc2626' }}>Reset to default model parameters</div>
              </div>
              <button className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'transparent', border: '1px solid rgba(158,240,26,0.25)', color: '#9ef01a' }}>
            Cancel
          </button>
          <button className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: '#9ef01a', color: '#0a1a00' }}>
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
