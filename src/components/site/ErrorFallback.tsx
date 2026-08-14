'use client'

import { useEffect, useRef, useState } from 'react'

export interface ErrorFallbackProps {
  error: Error & { digest?: string }
  retry: () => void
  title?: string
  message?: string
  autoRetries?: number
  compact?: boolean
}

export default function ErrorFallback({
  error,
  retry,
  title = 'কিছু একটা সমস্যা হয়েছে',
  message = 'আবার চেষ্টা করুন অথবা কিছুক্ষণ পর পেজটি রিফ্রেশ করুন।',
  autoRetries = 3,
  compact = false,
}: ErrorFallbackProps) {
  const [attempt, setAttempt] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const failed = attempt >= autoRetries

  useEffect(() => {
    console.error('[ErrorBoundary]', error)
    if (!failed) {
      timerRef.current = setTimeout(() => {
        setAttempt((a) => a + 1)
        retry()
      }, Math.min(2000 * Math.pow(2, attempt), 8000))
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [error, attempt, autoRetries, failed, retry])

  if (compact) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="card-surface rounded-2xl p-6 text-center">
          <div className="text-3xl">⚠️</div>
          <h2 className="mt-2 font-bold text-brand-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAttempt(0)
                retry()
              }}
              className="rounded-xl bg-brand-700 px-5 py-2 text-sm font-bold text-white hover:bg-brand-800 transition-colors"
            >
              আবার চেষ্টা করুন
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-brand-200 bg-white px-5 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50 transition-colors"
            >
              পেজ রিফ্রেশ
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">সমস্যাটি অব্যাহত থাকলে যোগাযোগ করুন।</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="card-surface w-full max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 text-3xl">
          ⚠️
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-brand-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</p>
        {!failed && (
          <p className="mt-3 text-xs font-semibold text-gold-600">
            স্বয়ংক্রিয়ভাবে আবার চেষ্টা হচ্ছে…
          </p>
        )}
        {failed && (
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setAttempt(0)
                retry()
              }}
              className="btn-gold rounded-xl px-6 py-3 font-bold text-brand-950"
            >
              🔄 আবার চেষ্টা করুন
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-brand-200 bg-white px-6 py-3 font-bold text-brand-700 hover:bg-brand-50 transition-colors"
            >
              পেজ রিফ্রেশ করুন
            </button>
          </div>
        )}
        {error?.digest && (
          <p className="mt-4 text-[11px] text-slate-400">রেফারেন্স: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
