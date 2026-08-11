'use client'

import { useEffect, useReducer } from 'react'
import Link from 'next/link'
import { computeShopStatus, type ShopStatusInput } from '@/lib/shop-status'
import { formatDurationBn } from '@/lib/format'

type Variant = 'chip' | 'section' | 'page'

const KIND_STYLES: Record<string, { ring: string; dot: string; chip: string }> = {
  open: { ring: 'border-emerald-200', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  closing_soon: { ring: 'border-orange-200', dot: 'bg-orange-500', chip: 'bg-orange-50 text-orange-700' },
  break: { ring: 'border-yellow-200', dot: 'bg-yellow-400', chip: 'bg-yellow-50 text-yellow-700' },
  closed: { ring: 'border-red-200', dot: 'bg-red-500', chip: 'bg-red-50 text-red-700' },
  holiday: { ring: 'border-red-200', dot: 'bg-red-500', chip: 'bg-red-50 text-red-700' },
  temp_closed: { ring: 'border-red-200', dot: 'bg-red-500', chip: 'bg-red-50 text-red-700' },
  force_open: { ring: 'border-emerald-200', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  force_closed: { ring: 'border-red-200', dot: 'bg-red-500', chip: 'bg-red-50 text-red-700' },
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
  const style = KIND_STYLES[result.kind]

  if (variant === 'chip') {
    return (
      <Link
        href="/status"
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${style.chip} hover:opacity-90 transition-opacity`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${style.dot} animate-pulse`} />
        {result.emoji} {result.label}
      </Link>
    )
  }

  return (
    <div className={`rounded-2xl border-2 ${style.ring} bg-white p-5 shadow-sm`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{result.emoji}</span>
        <div>
          <div className={`text-lg font-extrabold ${variant === 'page' ? 'text-2xl' : ''}`}>
            {result.label}
          </div>
          <div className="text-sm text-slate-600 font-medium">{result.detail}</div>
        </div>
      </div>

      {result.countdown && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <span className="text-sm font-semibold text-slate-600">
            {result.countdown.kind === 'close' ? '⏳ বন্ধ হতে বাকি' : '⏰ খোলা হতে বাকি'}
          </span>
          <LiveCountdown atMin={result.countdown.atMin} />
        </div>
      )}

      {result.resumeDate && (
        <p className="mt-3 text-sm text-amber-700 font-semibold">
          পুনরায় চালু হবে: {result.resumeDate}
        </p>
      )}

      {variant === 'page' && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoBox label="আজ খোলা" value={result.todayOpen ? fmt(result.todayOpen) : result.isOpenToday ? 'সারাদিন' : 'বন্ধ'} />
          <InfoBox label="আজ বন্ধ" value={result.todayClose ? fmt(result.todayClose) : '—'} />
          <InfoBox label="সময় অঞ্চল" value="ঢাকা (Asia/Dhaka)" />
        </div>
      )}
    </div>
  )
}

function fmt(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const h12 = h % 12 === 0 ? 12 : h % 12
  const period = h < 12 ? 'সকাল' : 'বিকাল'
  return `${period} ${h12}:${String(m).padStart(2, '0')}`
}

function LiveCountdown({ atMin }: { atMin: number }) {
  const [, tick] = useReducer((x: number) => x + 1, 0)
  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)
  const nowMin = Number(parts.find((p) => p.type === 'hour')!.value) * 60 +
    Number(parts.find((p) => p.type === 'minute')!.value)

  let diff = atMin - nowMin
  if (diff < 0) diff += 24 * 60

  return (
    <span className="font-mono text-lg font-bold text-brand-800" dir="ltr">
      {formatDurationBn(diff)}
    </span>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-brand-50 px-4 py-3">
      <div className="text-xs font-semibold text-brand-600">{label}</div>
      <div className="text-sm font-bold text-brand-900 mt-0.5">{value}</div>
    </div>
  )
}