'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.name.trim().length < 2 || form.message.trim().length < 5) {
      setStatus('error')
      return
    }
    setStatus('sending')
    const supabase = createClient()
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    })
    if (error) {
      setStatus('error')
      return
    }
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="text-5xl mb-3">✅</div>
        <h3 className="text-xl font-extrabold text-emerald-800">বার্তা পাঠানো হয়েছে</h3>
        <p className="mt-2 text-sm text-emerald-700">ধন্যবাদ! আমরা শীঘ্রই উত্তর দেব।</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        className={inputCls}
        placeholder="আপনার নাম *"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          className={inputCls}
          placeholder="মোবাইল নম্বর"
          value={form.phone}
          inputMode="tel"
          onChange={(e) => set('phone', e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="ই-মেইল"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
        />
      </div>
      <textarea
        className={inputCls}
        rows={4}
        placeholder="আপনার বার্তা *"
        value={form.message}
        onChange={(e) => set('message', e.target.value)}
      />
      {status === 'error' && (
        <p className="text-sm font-semibold text-red-600">নাম ও বার্তা কমপক্ষে পূরণ করুন।</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-xl bg-brand-700 py-3.5 font-bold text-white hover:bg-brand-800 disabled:opacity-60 transition-colors"
      >
        {status === 'sending' ? 'পাঠানো হচ্ছে...' : '✉ বার্তা পাঠান'}
      </button>
    </form>
  )
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition'