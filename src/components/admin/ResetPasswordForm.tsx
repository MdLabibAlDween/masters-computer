'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) setError('লিংকটি অকার্যকর। নতুন করে পাসওয়ার্ড রিসেট করুন।')
      void data
    })
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।')
      return
    }
    if (password !== confirm) {
      setError('দুটি পাসওয়ার্ড মিলছে না।')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error: upErr } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (upErr) {
      setError(`ব্যর্থ: ${upErr.message}`)
      return
    }
    setDone(true)
    setTimeout(() => router.push('/admin/login'), 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white border border-slate-100 shadow-xl p-8 space-y-4">
        <h1 className="text-xl font-extrabold text-brand-900">🔑 নতুন পাসওয়ার্ড দিন</h1>
        {done ? (
          <p className="text-sm font-bold text-emerald-600">✅ পাসওয়ার্ড পরিবর্তন হয়েছে — লগইন পেজে নিয়ে যাওয়া হচ্ছে...</p>
        ) : (
          <>
            <input
              type="password"
              required
              className={inputCls}
              placeholder="নতুন পাসওয়ার্ড (৮+ অক্ষর)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              required
              className={inputCls}
              placeholder="পাসওয়ার্ড আবার দিন"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-700 py-3.5 font-bold text-white hover:bg-brand-800 disabled:opacity-60 transition-colors"
            >
              {loading ? 'সেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
            </button>
          </>
        )}
      </form>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition'