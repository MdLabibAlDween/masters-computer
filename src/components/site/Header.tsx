'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BusinessSettings, ShopStatusOverride } from '@/types/db'

const NAV = [
  { href: '/', label: 'হোম' },
  { href: '/services', label: 'সেবাসমূহ' },
  { href: '/notices', label: 'নোটিশ' },
  { href: '/faq', label: 'প্রশ্নোত্তর' },
  { href: '/contact', label: 'যোগাযোগ' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [override, setOverride] = useState<ShopStatusOverride | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let alive = true
    Promise.all([
      supabase.from('business_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('shop_status_overrides').select('*').eq('id', 1).maybeSingle(),
    ]).then(([s, o]) => {
      if (!alive) return
      setSettings(s.data)
      setOverride(o.data as ShopStatusOverride | null)
    }).catch(() => {
      if (alive) setError(true)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0" onClick={() => setOpen(false)}>
            <Image
              src={settings?.logo_url || '/logo.png'}
              alt={settings?.name_bn ?? 'মাস্টার্স কম্পিউটার'}
              width={44}
              height={44}
              className="h-11 w-11 object-contain rounded-lg bg-white"
            />
            <div className="leading-tight">
              <div className="font-bold text-brand-900 text-lg">
                {settings?.name_bn ?? 'মাস্টার্স কম্পিউটার'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {settings?.address || 'সালথা বাজার, ফরিদপুর'}
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-brand-700 hover:bg-brand-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {settings?.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="hidden lg:inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800 transition-colors"
            >
              <span className="text-gold-400">☎</span>
              <span dir="ltr">{settings.phone}</span>
            </a>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-brand-50"
            aria-label="মেনু"
          >
            <svg className="h-6 w-6 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <nav className="md:hidden pb-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-brand-50"
              >
                {item.label}
              </Link>
            ))}
            {settings?.phone && (
              <a
                href={`tel:${settings.phone}`}
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-4 py-3 text-sm font-bold text-white"
              >
                <span className="text-gold-400">☎</span>
                <span dir="ltr">{settings.phone}</span>
              </a>
            )}
          </nav>
        )}
      </div>
      {!error && override && (
        <HeaderStatusBar label={override.status === 'force_open' ? 'সাময়িকভাবে খোলা' : override.status === 'force_closed' || override.status === 'temp_closed' ? 'সাময়িকভাবে বন্ধ' : ''} />
      )}
    </header>
  )
}

function HeaderStatusBar({ label }: { label: string }) {
  if (!label) return null
  return (
    <div className="bg-amber-500 text-white text-center text-xs font-bold py-1.5 px-4">
      {label}
    </div>
  )
}