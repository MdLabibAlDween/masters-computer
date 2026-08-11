'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ShopStatusOverride } from '@/types/db'
import { Btn, Card, Field, inputCls } from './ui'

export default function ShopOverrideForm({ initial }: { initial: ShopStatusOverride | null }) {
  const [status, setStatus] = useState<string>(initial?.status ?? 'normal')
  const [message, setMessage] = useState(initial?.message ?? '')
  const [resumeDate, setResumeDate] = useState(initial?.resume_date ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('shop_status_overrides')
      .upsert(
        {
          id: 1,
          status,
          message: status === 'force_open' || status === 'force_closed' || status === 'temp_closed' ? message : '',
          resume_date: status === 'temp_closed' && resumeDate ? resumeDate : null,
        },
        { onConflict: 'id' }
      )
    setSaving(false)
    if (error) {
      alert(`ব্যর্থ: ${error.message}`)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const OPTIONS = [
    { value: 'normal', label: 'স্বাভাবিক — সাপ্তাহিক সময়সূচি অনুযায়ী চলবে', icon: '✅' },
    { value: 'force_open', label: 'জোর করে খোলা — সব সময়সূচি উপেক্ষা করে খোলা দেখাবে', icon: '🟢' },
    { value: 'force_closed', label: 'জোর করে বন্ধ — সব সময়সূচি উপেক্ষা করে বন্ধ দেখাবে', icon: '🔴' },
    { value: 'temp_closed', label: 'সাময়িকভাবে বন্ধ — ঘোষণা ও পুনরায় চালুর তারিখসহ', icon: '⛔' },
  ]

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="space-y-3">
          {OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                status === o.value ? 'border-brand-500 bg-brand-50' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <input
                type="radio"
                name="override"
                className="mt-1 accent-brand-600"
                checked={status === o.value}
                onChange={() => setStatus(o.value)}
              />
              <span>
                <span className="block font-bold text-slate-800">{o.icon} {o.label}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      {(status === 'force_open' || status === 'force_closed' || status === 'temp_closed') && (
        <Card className="p-5 space-y-4">
          <Field label="বিজ্ঞপ্তি / বার্তা (ওয়েবসাইটে দেখাবে)" hint="যেমন: জরুরি কারণে দোকান সাময়িকভাবে বন্ধ।">
            <textarea
              className={inputCls}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="দর্শকদের জন্য বার্তা..."
            />
          </Field>
          {status === 'temp_closed' && (
            <Field label="পুনরায় চালুর তারিখ (ঐচ্ছিক)">
              <input type="date" className={inputCls} value={resumeDate} onChange={(e) => setResumeDate(e.target.value)} />
            </Field>
          )}
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Btn onClick={save} disabled={saving}>
          {saving ? 'সংরক্ষণ হচ্ছে...' : '💾 সংরক্ষণ করুন'}
        </Btn>
        {saved && <span className="text-sm font-bold text-emerald-600">✅ সংরক্ষিত হয়েছে</span>}
      </div>
    </div>
  )
}