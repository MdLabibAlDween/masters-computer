'use client'

import { useEffect, useReducer, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { computeShopStatus, type ShopStatusInput } from '@/lib/shop-status'

const emptySubscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

function useMounted() {
  return useSyncExternalStore(emptySubscribe, clientSnapshot, serverSnapshot)
}

type Variant = 'chip' | 'section' | 'page'

type KindStyle = {
  ring: string
  dot: string
  chip: string
  glow: string
  blob: string
  strip: string
  bar: string
}

const KIND_STYLES: Record<string, KindStyle> = {
open: {
    ring: 'ring-emerald-300/70',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700',
    glow: 'from-gold-400/15',
    blob: 'bg-gold-400/20',
    strip: 'border-gold-400/30 from-gold-400/15 to-gold-400/5',
    bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
  },
  closing_soon: {
    ring: 'ring-orange-300/70',
    dot: 'bg-orange-500',
    chip: 'bg-orange-50 text-orange-700',
    glow: 'from-orange-400/20',
    blob: 'bg-orange-400/25',
    strip: 'border-orange-200 from-orange-500/15 to-amber-400/10',
    bar: 'bg-gradient-to-r from-orange-400 to-orange-600',
  },
  break: {
    ring: 'ring-yellow-300/70',
    dot: 'bg-yellow-400',
    chip: 'bg-yellow-50 text-yellow-700',
    glow: 'from-yellow-400/20',
    blob: 'bg-yellow-400/25',
    strip: 'border-yellow-200 from-yellow-500/15 to-amber-400/10',
    bar: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
  },
  closed: {
    ring: 'ring-red-300/70',
    dot: 'bg-red-500',
    chip: 'bg-red-50 text-red-700',
    glow: 'from-red-400/15',
    blob: 'bg-red-400/20',
    strip: 'border-red-200 from-red-500/15 to-rose-400/10',
    bar: 'bg-gradient-to-r from-red-400 to-red-600',
  },
  holiday: {
    ring: 'ring-red-300/70',
    dot: 'bg-red-500',
    chip: 'bg-red-50 text-red-700',
    glow: 'from-red-400/15',
    blob: 'bg-red-400/20',
    strip: 'border-red-200 from-red-500/15 to-rose-400/10',
    bar: 'bg-gradient-to-r from-red-400 to-red-600',
  },
  temp_closed: {
    ring: 'ring-red-300/70',
    dot: 'bg-red-500',
    chip: 'bg-red-50 text-red-700',
    glow: 'from-red-400/15',
    blob: 'bg-red-400/20',
    strip: 'border-red-200 from-red-500/15 to-rose-400/10',
    bar: 'bg-gradient-to-r from-red-400 to-red-600',
  },
  force_open: {
    ring: 'ring-emerald-300/70',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700',
    glow: 'from-gold-400/15',
    blob: 'bg-gold-400/20',
    strip: 'border-gold-400/30 from-gold-400/15 to-gold-400/5',
    bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
  },
  force_closed: {
    ring: 'ring-red-300/70',
    dot: 'bg-red-500',
    chip: 'bg-red-50 text-red-700',
    glow: 'from-red-400/15',
    blob: 'bg-red-400/20',
    strip: 'border-red-200 from-red-500/15 to-rose-400/10',
    bar: 'bg-gradient-to-r from-red-400 to-red-600',
  },
}

export default function ShopStatusCard({
  schedule,
  variant = 'section',
}: {
  schedule: ShopStatusInput
  variant?: Variant
}) {
  const [, forceTick] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    const id = setInterval(forceTick, 1000)
    return () => clearInterval(id)
  }, [])

  const result = computeShopStatus(schedule)
  const style = KIND_STYLES[result.kind] ?? KIND_STYLES.closed

  if (variant === 'chip') {
    return (
      <Link
        href="/status"
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${style.chip} hover:opacity-90 hover:shadow-md transition-all`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${style.dot} animate-pulse`} />
        {result.emoji} {result.label}
        <span className="text-xs opacity-60 group-hover:translate-x-0.5 transition-transform">→</span>
      </Link>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-3xl card-glass p-6 sm:p-7 shadow-xl">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.glow} to-transparent`} />
      <div className={`pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full ${style.blob} blur-3xl`} />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-3">
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-brand-900 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1">
            <span className={`absolute h-2 w-2 rounded-full ${style.dot} animate-ping opacity-75`} />
            <span className={`relative h-2 w-2 rounded-full ${style.dot}`} />
            লাইভ
          </span>
          <div className="min-w-0 flex-1">
            <div className={`font-extrabold leading-tight ${variant === 'page' ? 'text-2xl' : 'text-xl'} text-brand-900`}>
              {result.emoji} {result.label}
            </div>
            <div className="text-sm text-slate-600 font-medium mt-0.5">{result.detail}</div>
          </div>
        </div>

        {result.countdown && (
          <div className={`mt-5 rounded-2xl border bg-gradient-to-r ${style.strip} px-5 py-4 flex flex-wrap items-center justify-between gap-3`}>
            <span className="text-sm font-bold text-brand-800">
              {result.countdown.kind === 'close' ? '⏳ বন্ধ হতে বাকি' : '⏰ খোলা হতে বাকি'}
            </span>
            <LiveCountdown atMin={result.countdown.atMin} />
          </div>
        )}

        {result.resumeDate && (
          <p className="mt-4 text-sm text-gold-600 font-bold bg-gold-400/10 border border-gold-500/30 rounded-xl px-4 py-2.5 inline-block">
            📅 পুনরায় চালু হবে: {result.resumeDate}
          </p>
        )}

        {variant === 'page' && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoBox label="আজ খোলা" value={result.todayOpen ? fmt(result.todayOpen) : result.isOpenToday ? 'সারাদিন' : 'বন্ধ'} />
            <InfoBox label="আজ বন্ধ" value={result.todayClose ? fmt(result.todayClose) : '—'} />
            <InfoBox label="সময় অঞ্চল" value="ঢাকা (Asia/Dhaka)" />
          </div>
        )}
      </div>
    </div>
  )
}

function fmt(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const h12 = h % 12 === 0 ? 12 : h % 12
  const period = h < 12 ? 'সকাল' : 'বিকাল'
  return `${period} ${h12}:${String(m).padStart(2, '0')}`
}

function nowDhaka() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now)
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value)
  return { h: get('hour'), m: get('minute'), s: get('second') }
}

function LiveCountdown({ atMin }: { atMin: number }) {
  const mounted = useMounted()
  const [, tick] = useReducer((x: number) => x + 1, 0)
  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (!mounted) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xl font-extrabold text-brand-900 tabular-nums" dir="ltr">
        <DashCell /> <span className="text-slate-400">:</span>
        <DashCell /> <span className="text-slate-400">:</span>
        <DashCell />
      </span>
    )
  }

  const { h, m, s } = nowDhaka()
  let total = atMin * 60 - (h * 3600 + m * 60 + s)
  if (total < 0) total += 24 * 3600
  const hh = Math.floor(total / 3600)
  const mm = Math.floor((total % 3600) / 60)
  const ss = total % 60

  return (
    <span className="inline-flex items-center gap-1 font-mono text-xl font-extrabold text-brand-900 tabular-nums" dir="ltr">
      <TimeCell v={hh} /> <span className="text-slate-400">:</span>
      <TimeCell v={mm} /> <span className="text-slate-400">:</span>
      <TimeCell v={ss} pulse />
    </span>
  )
}

function TimeCell({ v, pulse }: { v: number; pulse?: boolean }) {
  const pad = String(v).padStart(2, '0').replace(/[0-9]/g, (d) => BN[Number(d)])
  return (
    <span className={`rounded-lg bg-white/80 border border-brand-200/60 px-2 py-1 shadow-sm ${pulse ? 'text-gold-500' : ''}`}>
      {pad}
    </span>
  )
}

function DashCell() {
  return (
    <span className="rounded-lg bg-white/80 border border-brand-200/60 px-2 py-1 shadow-sm text-brand-300">
      — —
    </span>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/60 border border-brand-100 px-4 py-3.5">
      <div className="text-xs font-bold text-brand-600">{label}</div>
      <div className="text-sm font-extrabold text-brand-900 mt-0.5">{value}</div>
    </div>
  )
}

const BN = '০১২৩৪৫৬৭৮৯'
