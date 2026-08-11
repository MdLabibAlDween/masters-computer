'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ServiceWithCategory } from '@/types/db'

export default function RequestForm({
  services,
  defaultServiceId,
}: {
  services: ServiceWithCategory[]
  defaultServiceId?: number
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    service_id: defaultServiceId ?? '',
    message: '',
    preferred_date: '',
    preferred_time: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [errorText, setErrorText] = useState('')

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorText('')
    if (form.name.trim().length < 2 || form.phone.trim().length < 6) {
      setStatus('error')
      setErrorText('নাম ও সঠিক মোবাইল নম্বর দিন।')
      return
    }
    const supabase = createClient()
    const serviceId = typeof form.service_id === 'string' && form.service_id ? Number(form.service_id) : null
    const { error } = await supabase.from('service_requests').insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      service_id: serviceId,
      service_name: serviceId ? services.find((s) => s.id === serviceId)?.name_bn : form.message ? '' : '',
      message: form.message.trim(),
      preferred_date: form.preferred_date || null,
      preferred_time: form.preferred_time || null,
    })
    if (error) {
      setStatus('error')
      setErrorText('দুঃখিত, আবেদন পাঠানো যায়নি। পরে আবার চেষ্টা করুন বা ফোনে যোগাযোগ করুন।')
      return
    }
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="text-5xl mb-3">✅</div>
        <h3 className="text-xl font-extrabold text-emerald-800">আবেদন পাঠানো হয়েছে</h3>
        <p className="mt-2 text-sm text-emerald-700">
          আমরা খুব শীঘ্রই আপনার সাথে যোগাযোগ করব। প্রয়োজনে সরাসরি ফোনে জানাতে পারেন।
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="আপনার নাম *">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="আপনার নাম"
          />
        </Field>
        <Field label="মোবাইল নম্বর *">
          <input
            className={inputCls}
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="01XXXXXXXXX"
            inputMode="tel"
          />
        </Field>
      </div>
      <Field label="কোন সেবা দরকার?">
        <select
          className={inputCls}
          value={form.service_id}
          onChange={(e) => set('service_id', e.target.value)}
        >
          <option value="">— সেবা নির্বাচন করুন —</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.name_bn}
            </option>
          ))}
        </select>
      </Field>
      <Field label="বিস্তারিত (ঐচ্ছিক)">
        <textarea
          className={inputCls}
          rows={3}
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          placeholder="যা জানাতে চান লিখুন..."
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="পছন্দের তারিখ (ঐচ্ছিক)">
          <input
            type="date"
            className={inputCls}
            value={form.preferred_date}
            onChange={(e) => set('preferred_date', e.target.value)}
          />
        </Field>
        <Field label="পছন্দের সময় (ঐচ্ছিক)">
          <input
            type="time"
            className={inputCls}
            value={form.preferred_time}
            onChange={(e) => set('preferred_time', e.target.value)}
          />
        </Field>
      </div>
      {status === 'error' && (
        <p className="text-sm font-semibold text-red-600">{errorText}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-xl bg-brand-700 py-3.5 font-bold text-white hover:bg-brand-800 disabled:opacity-60 transition-colors"
      >
        {status === 'sending' ? 'পাঠানো হচ্ছে...' : '📩 আবেদন পাঠান'}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition'