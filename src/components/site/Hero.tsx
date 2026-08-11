import Link from 'next/link'
import Image from 'next/image'
import ShopStatusCard from '@/components/site/ShopStatusCard'
import type { BusinessSettings } from '@/types/db'
import type { ShopStatusInput } from '@/lib/shop-status'

export default function Hero({
  settings,
  schedule,
}: {
  settings: BusinessSettings | null
  schedule: ShopStatusInput
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #fbbf24 0, transparent 30%), radial-gradient(circle at 80% 70%, #60a5fa 0, transparent 35%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <ShopStatusCard schedule={schedule} variant="chip" />
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            {settings?.name_bn ?? 'মাস্টার্স কম্পিউটার'}
          </h1>
          <p className="mt-2 text-lg font-bold text-gold-400">
            📍 {settings?.address || 'সালথা বাজার, ফরিদপুর'}
          </p>
          <p className="mt-4 text-brand-100 leading-relaxed max-w-xl">
            {settings?.tagline ||
              'অনলাইন আবেদন, টিকিট, ভিসা, NID, জমি সংক্রান্ত সেবা এবং বিভিন্ন ডিজিটাল সেবা।'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 font-bold text-brand-950 hover:bg-gold-400 transition-colors"
            >
              🛠 সেবাসমূহ দেখুন
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/30 px-6 py-3 font-bold text-white hover:bg-white/20 transition-colors"
            >
              📞 যোগাযোগ করুন
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-brand-200">
            {settings?.phone && (
              <a href={`tel:${settings.phone}`} className="hover:text-white" dir="ltr">
                ☎ {settings.phone}
              </a>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`} className="hover:text-white" dir="ltr">
                ✉ {settings.email}
              </a>
            )}
          </div>
        </div>
        <div className="hidden lg:flex justify-center">
          <div className="rounded-3xl bg-white/10 border border-white/20 p-6 backdrop-blur">
            <Image
              src={settings?.logo_url || '/logo.png'}
              alt={settings?.name_bn ?? 'মাস্টার্স কম্পিউটার'}
              width={320}
              height={320}
              className="h-64 w-auto object-contain rounded-2xl bg-white p-4"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}