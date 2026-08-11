'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Faq, SiteSettings } from '@/types/db'
import { Btn, Card, Field, PageHeader, inputCls } from './ui'

export default function SettingsManager({
  settings,
  faqs,
}: {
  settings: SiteSettings[]
  faqs: Faq[]
}) {
  const [kv, setKv] = useState<Record<string, string>>(
    Object.fromEntries(settings.map((s) => [s.key, s.value]))
  )
  const [faqRows, setFaqRows] = useState(faqs)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const setVal = (key: string, v: string) => setKv((m) => ({ ...m, [key]: v }))

  function setFaq(idx: number, patch: Partial<Faq>) {
    setFaqRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  async function saveAll() {
    setSaving(true)
    const supabase = createClient()
    const errors: string[] = []
    for (const [key, value] of Object.entries(kv)) {
      const { error } = await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
      if (error) errors.push(error.message)
    }
    for (let i = 0; i < faqRows.length; i++) {
      const f = faqRows[i]
      const payload = {
        question: f.question,
        answer: f.answer,
        link_label: f.link_label ?? '',
        link_url: f.link_url ?? '',
        display_order: i + 1,
        active: f.active ?? true,
      }
      const { error } = f.id
        ? await supabase.from('faqs').update(payload).eq('id', f.id)
        : await supabase.from('faqs').insert(payload)
      if (error) errors.push(error.message)
    }
    setSaving(false)
    if (errors.length > 0) {
      alert(`কিছু অংশ ব্যর্থ হয়েছে: ${errors.join('; ')}`)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="⚙️ সেটিংস ও FAQ"
        subtitle="হোমপেজের কিছু পাঠ্য ও প্রশ্নোত্তর পরিচালনা করুন"
        action={
          <Btn onClick={saveAll} disabled={saving}>
            {saving ? 'সংরক্ষণ হচ্ছে...' : '💾 সব সংরক্ষণ করুন'}
          </Btn>
        }
      />
      {saved && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-800">
          ✅ সংরক্ষিত হয়েছে
        </div>
      )}

      <Card className="p-5">
        <h2 className="text-lg font-extrabold text-brand-900 mb-4">📝 সাইট টেক্সট</h2>
        <div className="space-y-4">
          <Field label="কাগজপত্রের নোট (হোমপেজ ও ডকুমেন্টস পেজে দেখাবে)">
            <textarea
              className={inputCls}
              rows={2}
              value={kv.documents_note ?? ''}
              onChange={(e) => setVal('documents_note', e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="সম্পর্কে সেকশনের শিরোনাম">
              <input className={inputCls} value={kv.home_about_title ?? ''} onChange={(e) => setVal('home_about_title', e.target.value)} />
            </Field>
            <Field label="নতুন সুবিধা সেকশনের শিরোনাম">
              <input className={inputCls} value={kv.home_facilities_title ?? ''} onChange={(e) => setVal('home_facilities_title', e.target.value)} />
            </Field>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-brand-900">❓ প্রশ্নোত্তর (FAQ)</h2>
          <Btn
            variant="success"
            onClick={() =>
              setFaqRows((rs) => [
                ...rs,
                { id: 0, question: '', answer: '', link_label: '', link_url: '', display_order: rs.length + 1, active: true },
              ])
            }
          >
            ➕ প্রশ্ন যোগ
          </Btn>
        </div>
        <div className="space-y-4">
          {faqRows.map((f, i) => (
            <div key={f.id || `new-${i}`} className="rounded-xl border border-slate-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">প্রশ্ন #{toBn(i + 1)}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFaqRows((rs) =>
                      f.id
                        ? rs.map((r) => (r.id === f.id ? { ...r, active: !r.active } : r))
                        : rs.filter((_, j) => j !== i)
                    )
                  }
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  {f.id ? (f.active ? 'লুকান' : 'দেখান') : 'সরান'}
                </button>
              </div>
              <Field label="প্রশ্ন *">
                <input className={inputCls} value={f.question} onChange={(e) => setFaq(i, { question: e.target.value })} />
              </Field>
              <Field label="উত্তর">
                <textarea className={inputCls} rows={2} value={f.answer} onChange={(e) => setFaq(i, { answer: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="লিংক লেবেল (ঐচ্ছিক)">
                  <input className={inputCls} value={f.link_label ?? ''} onChange={(e) => setFaq(i, { link_label: e.target.value })} placeholder="যেমন: পাসপোর্ট সেবা দেখুন" />
                </Field>
                <Field label="লিংক URL">
                  <input className={inputCls} value={f.link_url ?? ''} onChange={(e) => setFaq(i, { link_url: e.target.value })} placeholder="/services/passport-application" dir="ltr" />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Btn onClick={saveAll} disabled={saving}>
          {saving ? 'সংরক্ষণ হচ্ছে...' : '💾 সব সংরক্ষণ করুন'}
        </Btn>
        {saved && <span className="text-sm font-bold text-emerald-600 self-center">✅ সংরক্ষিত</span>}
      </div>
    </div>
  )
}

const BN = '০১২৩৪৫৬৭৮৯'
const toBn = (n: number) => String(n).replace(/[0-9]/g, (d) => BN[Number(d)])