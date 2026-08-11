'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (authError || !data.user) {
      setError('ই-মেইল বা পাসওয়ার্ড ভুল হয়েছে।')
      setLoading(false)
      return
    }
    const { data: admin } = await supabase
      .from('admin_users')
      .select('id, active')
      .eq('user_id', data.user.id)
      .maybeSingle()
    if (!admin || !admin.active) {
      await supabase.auth.signOut()
      setError('এই অ্যাকাউন্টে অ্যাডমিন প্যানেলে প্রবেশের অনুমতি নেই।')
      setLoading(false)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  async function resetPassword() {
    setError('')
    if (!email) {
      setError('পাসওয়ার্ড রিসেটের জন্য ই-মেইল দিন।')
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })
    if (error) {
      setError('রিসেট ই-মেইল পাঠানো যায়নি।')
      return
    }
    setResetSent(true)
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white border border-slate-100 shadow-xl p-8 sm:p-10">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="মাস্টার্স কম্পিউটার"
            width={72}
            height={72}
            className="mx-auto h-20 w-20 object-contain rounded-xl"
          />
          <h1 className="mt-4 text-2xl font-extrabold text-brand-900">অ্যাডমিন লগইন</h1>
          <p className="mt-1 text-sm text-slate-500">মাস্টার্স কম্পিউটার — অ্যাডমিন প্যানেল</p>
        </div>

        {resetSent && (
          <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-800">
            ✅ পাসওয়ার্ড রিসেটের লিংক আপনার ই-মেইলে পাঠানো হয়েছে।
          </div>
        )}

        <form onSubmit={login} className="mt-6 space-y-4">
          <input
            type="email"
            required
            className={inputCls}
            placeholder="ই-মেইল"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            className={inputCls}
            placeholder="পাসওয়ার্ড"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="text-sm font-semibold text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-700 py-3.5 font-bold text-white hover:bg-brand-800 disabled:opacity-60 transition-colors"
          >
            {loading ? 'প্রবেশ করা হচ্ছে...' : '🔐 লগইন করুন'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={resetPassword}
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            পাসওয়ার্ড ভুলে গেছেন?
          </button>
        </div>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition'