'use client'

import { useEffect, useState } from 'react'
import { computeShopStatus, type ShopStatusInput } from '@/lib/shop-status'

export default function ShopStatusPreview({ schedule }: { schedule: ShopStatusInput }) {
  const [label, setLabel] = useState('')
  const [detail, setDetail] = useState('')

  useEffect(() => {
    const update = () => {
      const r = computeShopStatus(schedule)
      setLabel(`${r.emoji} ${r.label}`)
      setDetail(r.detail)
    }
    update()
    const id = setInterval(update, 5_000)
    return () => clearInterval(id)
  }, [schedule])

  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="font-extrabold text-brand-900">{label || 'গণনা হচ্ছে...'}</div>
      <div className="mt-1 text-sm text-slate-600">{detail || '—'}</div>
    </div>
  )
}