'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { computeShopStatus, type ShopStatusInput } from '@/lib/shop-status'
import type { Faq } from '@/types/db'

export default function FAQList({
  faqs,
  schedule,
}: {
  faqs: Faq[]
  schedule: ShopStatusInput
}) {
  const [openId, setOpenId] = useState<number | null>(null)
  const [statusLabel, setStatusLabel] = useState('')

  useEffect(() => {
    const update = () => setStatusLabel(computeShopStatus(schedule).label)
    update()
    const id = setInterval(update, 30_000)
    return () => clearInterval(id)
  }, [schedule])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4 text-sm font-semibold text-brand-900 flex items-center gap-3">
        <span className="text-2xl">⏱</span>
        <span>
          আজকের অবস্থা: <span className="text-brand-700">{statusLabel}</span> —{' '}
          <Link href="/status" className="underline underline-offset-2 hover:text-brand-600">
            বিস্তারিত দেখুন
          </Link>
        </span>
      </div>

      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden"
        >
          <button
            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-brand-900 hover:bg-brand-50/50 transition-colors"
          >
            <span>❓ {faq.question}</span>
            <span
              className={`shrink-0 text-brand-500 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`}
            >
              ▾
            </span>
          </button>
          {openId === faq.id && (
            <div className="px-5 pb-5">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{faq.answer}</p>
              {faq.link_url && (
                <Link
                  href={faq.link_url}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800 transition-colors"
                >
                  {faq.link_label || 'বিস্তারিত'} →
                </Link>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}