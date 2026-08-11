'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BusinessSettings, SocialLinks } from '@/types/db'

const QUICK_LINKS = [
  { href: '/services', label: 'সেবাসমূহ' },
  { href: '/status', label: 'দোকানের অবস্থা' },
  { href: '/documents', label: 'প্রয়োজনীয় কাগজপত্র' },
  { href: '/notices', label: 'নোটিশ ও আপডেট' },
]

export default function Footer() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [social, setSocial] = useState<SocialLinks | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let alive = true
    Promise.all([
      supabase.from('business_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('social_links').select('*').eq('id', 1).maybeSingle(),
    ]).then(([s, l]) => {
      if (!alive) return
      setSettings(s.data)
      setSocial(l.data)
    }).catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const phone = settings?.phone
  const whatsapp = social?.whatsapp || ''

  return (
    <footer className="bg-brand-950 text-slate-300 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src={settings?.logo_url || '/logo.png'}
              alt={settings?.name_bn ?? 'মাস্টার্স কম্পিউটার'}
              width={48}
              height={48}
              className="h-12 w-12 object-contain rounded-lg bg-white/10"
            />
            <div>
              <div className="font-bold text-white text-lg leading-tight">
                {settings?.name_bn ?? 'মাস্টার্স কম্পিউটার'}
              </div>
              <div className="text-xs text-brand-300">{settings?.name_en ?? 'Masters Computer'}</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            {settings?.tagline || 'অনলাইন আবেদন, টিকিট, ভিসা, NID, জমি সংক্রান্ত সেবা এবং বিভিন্ন ডিজিটাল সেবা।'}
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">দ্রুত লিংক</h3>
          <ul className="space-y-2 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-gold-400 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/location" className="hover:text-gold-400 transition-colors">
                লোকেশন
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">যোগাযোগ</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span>📍</span>
              <span>{settings?.address || 'সালথা বাজার, ফরিদপুর'}</span>
            </li>
            {phone && (
              <li className="flex items-center gap-2">
                <span>☎</span>
                <a href={`tel:${phone}`} className="hover:text-gold-400" dir="ltr">
                  {phone}
                </a>
              </li>
            )}
            {settings?.phone_secondary && (
              <li className="flex items-center gap-2">
                <span>☎</span>
                <a href={`tel:${settings.phone_secondary}`} className="hover:text-gold-400" dir="ltr">
                  {settings.phone_secondary}
                </a>
              </li>
            )}
            {settings?.email && (
              <li className="flex items-center gap-2">
                <span>✉</span>
                <a href={`mailto:${settings.email}`} className="hover:text-gold-400" dir="ltr">
                  {settings.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">সোশ্যাল মিডিয়া</h3>
          <div className="flex flex-wrap gap-2">
            {social?.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold hover:bg-brand-800 transition-colors"
                aria-label="Facebook"
              >
                <span>📘</span> Facebook
              </a>
            )}
            {whatsapp && (
              <a
                href={whatsapp.startsWith('http') ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold hover:bg-emerald-600 transition-colors"
                aria-label="WhatsApp"
              >
                <span>💬</span> WhatsApp
              </a>
            )}
            {social?.youtube && (
              <a
                href={social.youtube}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-red-700 px-4 py-2 text-sm font-semibold hover:bg-red-600 transition-colors"
                aria-label="YouTube"
              >
                <span>▶</span> YouTube
              </a>
            )}
            {social?.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold hover:bg-brand-800 transition-colors"
                aria-label="Instagram"
              >
                <span>📸</span> Instagram
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-brand-900">
        <div className="mx-auto max-w-6xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {settings?.name_bn ?? 'মাস্টার্স কম্পিউটার'} — সর্বস্বত্ব সংরক্ষিত
          </div>
          <div>
            ডেভেলপার:{' '}
            <span className="text-brand-300">Md Labib Al Dween</span>
          </div>
        </div>
      </div>
    </footer>
  )
}