'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { computeShopStatus, type ShopStatusInput } from '@/lib/shop-status'
import type { Faq } from '@/types/db'

function FaqCard({
  faq,
  open,
  onToggle,
}: {
  faq: Faq
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`faq-answer-${faq.id}`}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-brand-900 hover:bg-brand-50/50 transition-colors"
      >
        <span>❓ {faq.question}</span>
        <span
          className={`shrink-0 text-brand-500 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div id={`faq-answer-${faq.id}`} className="px-5 pb-5">
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
  )
}

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

  const midpoint = Math.ceil(faqs.length / 2)
  const leftFaqs = faqs.slice(0, midpoint)
  const rightFaqs = faqs.slice(midpoint)

  const toggle = (id: number) => setOpenId(openId === id ? null : id)

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

      <div className="flex flex-col gap-4 items-start sm:flex-row">
        <div className="flex flex-col gap-4 w-full sm:w-1/2">
          {leftFaqs.map((faq) => (
            <FaqCard
              key={faq.id}
              faq={faq}
              open={openId === faq.id}
              onToggle={() => toggle(faq.id)}
            />
          ))}
        </div>
        <div className="flex flex-col gap-4 w-full sm:w-1/2">
          {rightFaqs.map((faq) => (
            <FaqCard
              key={faq.id}
              faq={faq}
              open={openId === faq.id}
              onToggle={() => toggle(faq.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}