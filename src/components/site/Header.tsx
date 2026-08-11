'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BusinessSettings, ShopStatusOverride } from '@/types/db'
import type { ShopStatusInput } from '@/lib/shop-status'
import ShopStatusCard from '@/components/site/ShopStatusCard'

const NAV = [
  { href: '/', label: 'হোম' },
  { href: '/services', label: 'সেবাসমূহ' },
  { href: '/notices', label: 'নোটিশ' },
  { href: '/faq', label: 'প্রশ্নোত্তর' },
  { href: '/contact', label: 'যোগাযোগ' },
]

const EMPTY_SCHEDULE: ShopStatusInput = {
  hours: [],
  breaks: [],
  holidays: [],
  specialDays: [],
  override: null,
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [schedule, setSchedule] = useState<ShopStatusInput>(EMPTY_SCHEDULE)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let alive = true
    Promise.all([
      supabase.from('business_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('business_hours').select('*').order('day_of_week'),
      supabase.from('break_times').select('*').order('day_of_week'),
      supabase.from('holidays').select('*').order('date'),
      supabase.from('special_days').select('*').order('date'),
      supabase.from('shop_status_overrides').select('*').eq('id', 1).maybeSingle(),
    ])
      .then(([s, h, b, hol, sp, o]) => {
        if (!alive) return
        setSettings(s.data)
        setSchedule({
          hours: h.data ?? [],
          breaks: b.data ?? [],
          holidays: hol.data ?? [],
          specialDays: sp.data ?? [],
          override: (o.data as ShopStatusOverride | null) ?? null,
        })
        setLoaded(true)
      })
      .catch(() => {
        if (alive) setLoaded(true)
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

          <div className="hidden lg:flex items-center gap-3">
            {loaded && <ShopStatusCard schedule={schedule} variant="chip" />}
            {settings?.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800 transition-colors"
              >
                <span className="text-gold-400">☎</span>
                <span dir="ltr">{settings.phone}</span>
              </a>
            )}
          </div>

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
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            {loaded && <ShopStatusCard schedule={schedule} variant="chip" />}
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
      {loaded && schedule.override && (
        <HeaderStatusBar label={schedule.override.status === 'force_open' ? 'সাময়িকভাবে খোলা' : schedule.override.status === 'force_closed' || schedule.override.status === 'temp_closed' ? 'সাময়িকভাবে বন্ধ' : ''} />
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