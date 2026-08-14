'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ITEMS = [
  { href: '/', icon: '🏠', label: 'হোম' },
  { href: '/services', icon: '⚙️', label: 'সেবাসমূহ' },
  { href: '/status', icon: '⏱', label: 'অবস্থা' },
  { href: '/location', icon: '📍', label: 'লোকেশন' },
]

export default function MobileNav() {
  const pathname = usePathname()
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

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`))

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-brand-200/60 shadow-[0_-4px_12px_rgba(61,64,91,0.12)] md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold transition-colors ${
              isActive(item.href) ? 'text-brand-700 font-bold' : 'text-slate-600 active:text-brand-700'
            }`}
          >
            <span className={`text-lg leading-none ${isActive(item.href) ? 'opacity-100' : 'opacity-80'}`}>{item.icon}</span>
            <span className="truncate max-w-full px-0.5 leading-tight">{item.label}</span>
          </Link>
        ))}
        <a
          href={phone ? `tel:${phone}` : '#'}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-bold ${
            phone ? 'text-white bg-emerald-600' : 'text-slate-500'
          }`}
        >
          <span className="text-lg leading-none">📞</span>
          <span className="truncate max-w-full px-0.5 leading-tight">কল করুন</span>
        </a>
      </div>
    </nav>
  )
}