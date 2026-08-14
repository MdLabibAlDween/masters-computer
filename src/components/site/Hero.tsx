import Link from 'next/link'
import Image from 'next/image'
import ShopStatusCard from '@/components/site/ShopStatusCard'
import LiveTerminal from '@/components/site/LiveTerminal'
import InstallAppButton from '@/components/site/InstallAppButton'
import { computeShopStatus } from '@/lib/shop-status'
import { WhiteIcon } from '@/components/site/Icons'
import type { BusinessSettings } from '@/types/db'
import type { ShopStatusInput } from '@/lib/shop-status'

export default function Hero({
  settings,
  schedule,
}: {
  settings: BusinessSettings | null
  schedule: ShopStatusInput
}) {
  const status = computeShopStatus(schedule)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #fbbf24 0, transparent 30%), radial-gradient(circle at 80% 70%, #60a5fa 0, transparent 35%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16 grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_1fr] items-center">
        {/* Left — brand & actions */}
        <div>
          <div className="flex items-center gap-3">
            <Image
              src={settings?.logo_url || '/logo.png'}
              alt={settings?.name_bn ?? 'মাস্টার্স কম্পিউটার'}
              width={52}
              height={52}
              className="h-13 w-13 object-contain"
            />
            <div className="leading-tight">
              <div className="text-[11px] font-bold uppercase tracking-widest text-brand-300">
                {settings?.tagline ? 'ডিজিটাল সেবা' : 'ডিজিটাল সেবা'}
              </div>
              <div className="text-sm font-bold text-white">
                {settings?.name_en || 'Masters Computer'}
              </div>
            </div>
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            {settings?.name_bn ?? 'মাস্টার্স কম্পিউটার'}
          </h1>
          <p className="mt-3 text-lg font-semibold text-gold-400">
            📍 {settings?.address || 'সালথা বাজার, ফরিদপুর'}
          </p>
          <p className="mt-4 text-brand-100/90 leading-relaxed max-w-xl">
            {settings?.tagline ||
              'অনলাইন আবেদন, টিকিট, ভিসা, NID, জমি সংক্রান্ত সেবা এবং বিভিন্ন ডিজিটাল সেবা — সব এক জায়গায়।'}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <Link
              href="/services"
              className="btn-gold inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-brand-950 sm:px-6"
            >
              ⚙️ সেবাসমূহ দেখুন
            </Link>
            <Link
              href="/request"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/25 px-4 py-3 font-bold text-white hover:bg-white/20 hover:-translate-y-0.5 transition-all sm:px-6"
            >
              📩 সেবা আবেদন করুন
            </Link>
            <InstallAppButton />
          </div>
        </div>

        {/* Right — software-style dashboard window */}
        <div className="relative block">
          <div className="absolute -inset-6 bg-gold-500/10 blur-3xl rounded-full" />
          <div className="relative rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md shadow-2xl shadow-brand-950/50 overflow-hidden">
            {/* Window title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <span className="h-3 w-3 rounded-full bg-red-400/90" />
              <span className="h-3 w-3 rounded-full bg-yellow-400/90" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
              <span className="ml-3 text-xs font-bold text-brand-200 truncate">
                masters-computer / ড্যাশবোর্ড
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                লাইভ
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Terminal-style live status */}
              <LiveTerminal
                emoji={status.emoji}
                label={status.label}
                countdown={status.countdown}
              />

              {/* Quick actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {QUICK.map((q) => (
                  <Link
                    key={q.href}
                    href={q.href}
                    className="group flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.06] border border-white/10 px-2 py-3 hover:bg-white/15 hover:border-gold-400/40 transition-all"
                  >
                    <span className="group-hover:scale-110 transition-transform"><WhiteIcon emoji={q.icon} className="h-6 w-6" /></span>
                    <span className="text-[10px] font-bold text-brand-200 text-center leading-tight">
                      {q.label}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Footer bar */}
              <div className="flex items-center justify-between text-[11px] font-bold text-brand-300">
                <span>⚡ দ্রুত সেবা • নির্ভরযোগ্য</span>
                {settings?.phone && (
                  <a href={`tel:${settings.phone}`} className="text-gold-300 hover:text-gold-200 transition-colors" dir="ltr">
                    ☎ {settings.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live status chip — centered below the hero grid */}
      <div className="relative mx-auto max-w-6xl px-4 pb-10 flex justify-center">
        <ShopStatusCard schedule={schedule} variant="chip" />
      </div>
    </section>
  )
}

const QUICK = [
  { icon: '⚙️', label: 'সেবাসমূহ', href: '/services' },
  { icon: '📩', label: 'সেবা আবেদন', href: '/request' },
  { icon: '📄', label: 'কাগজপত্র', href: '/documents' },
  { icon: '📍', label: 'অবস্থান', href: '/location' },
]
