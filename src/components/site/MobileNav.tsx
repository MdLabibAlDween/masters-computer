'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ITEMS = [
  { href: '/', icon: '🏠', label: 'হোম' },
  { href: '/services', icon: '🛠', label: 'সেবাসমূহ' },
  { href: '/status', icon: '⏱', label: 'অবস্থা' },
  { href: '/location', icon: '📍', label: 'লোকেশন' },
]

export default function MobileNav() {
  const [phone, setPhone] = useState('')

  useEffect(() => {
    const supabase = createClient()
    let alive = true
    void (async () => {
      try {
        const { data } = await supabase
          .from('business_settings')
          .select('phone')
          .eq('id', 1)
          .maybeSingle()
        if (alive) setPhone(data?.phone ?? '')
      } catch {
        /* ignore */
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold text-slate-600 active:text-brand-700"
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold text-white bg-emerald-600"
          >
            <span className="text-lg leading-none">📞</span>
            কল করুন
          </a>
        )}
      </div>
    </nav>
  )
}