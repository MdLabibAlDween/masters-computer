'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BusinessSettings, Notice, ShopStatusOverride } from '@/types/db'
import type { ShopStatusInput } from '@/lib/shop-status'
import ShopStatusCard from '@/components/site/ShopStatusCard'
import NoticeTicker from '@/components/site/NoticeTicker'

const NAV = [
  { href: '/', label: 'হোম' },
  { href: '/services', label: 'সেবাসমূহ' },
  { href: '/request', label: 'সেবা আবেদন' },
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
  const pathname = usePathname()
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [schedule, setSchedule] = useState<ShopStatusInput>(EMPTY_SCHEDULE)
  const [notices, setNotices] = useState<Notice[]>([])
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
      supabase.from('notices').select('*').eq('published', true).limit(10),
    ])
      .then(([s, h, b, hol, sp, o, n]) => {
        if (!alive) return
        setSettings(s.data)
        setSchedule({
          hours: h.data ?? [],
          breaks: b.data ?? [],
          holidays: hol.data ?? [],
          specialDays: sp.data ?? [],
          override: (o.data as ShopStatusOverride | null) ?? null,
        })
        setNotices(n.data ?? [])
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
          <Link href="/" className="flex items-center gap-3 shrink-0 min-w-0">
            <Image
              src={settings?.logo_url || '/logo.png'}
              alt={settings?.name_bn ?? 'মাস্টার্স কম্পিউটার'}
              width={44}
              height={44}
              className="h-11 w-11 object-contain shrink-0"
            />
            <div className="leading-tight min-w-0">
              <div className="font-bold text-brand-900 text-lg truncate">
                {settings?.name_bn ?? 'মাস্টার্স কম্পিউটার'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium truncate">
                {settings?.address || 'সালথা বাজার, ফরিদপুর'}
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-slate-700 hover:text-brand-700 hover:bg-brand-50'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-1 w-6 rounded-full bg-gradient-to-r from-gold-500 to-sage-400" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {loaded ? (
              <ShopStatusCard schedule={schedule} variant="chip" />
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 animate-pulse">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-3.5 w-20 rounded bg-slate-200" />
              </div>
            )}
            {settings?.phone ? (
              <a
                href={`tel:${settings.phone}`}
                className="hidden xl:inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800 transition-colors"
              >
                <span className="text-gold-400">☎</span>
                <span dir="ltr">{settings.phone}</span>
              </a>
            ) : (
              <div className="hidden xl:inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 animate-pulse">
                <span className="h-3.5 w-24 rounded bg-brand-200" />
              </div>
            )}
          </div>
        </div>
      </div>

        {loaded && schedule.override && (
        <HeaderStatusBar label={schedule.override.status === 'force_open' ? 'সাময়িকভাবে খোলা' : schedule.override.status === 'force_closed' || schedule.override.status === 'temp_closed' ? 'সাময়িকভাবে বন্ধ' : ''} />
      )}

      {notices.length > 0 && <NoticeTicker notices={notices} />}
    </header>
  )
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function HeaderStatusBar({ label }: { label: string }) {
  if (!label) return null
  return (
    <div className="bg-gold-500 text-white text-center text-xs font-bold py-1.5 px-4">
      {label}
    </div>
  )
}