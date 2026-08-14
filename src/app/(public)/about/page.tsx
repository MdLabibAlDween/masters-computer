import Link from 'next/link'
import SectionHeading from '@/components/site/SectionHeading'
import { getBusinessSettings, getCategories } from '@/lib/data'

export const metadata = { title: 'আমাদের সম্পর্কে' }

export default async function AboutPage() {
  const [settings, categories] = await Promise.all([getBusinessSettings(), getCategories()])

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SectionHeading title="আমাদের সম্পর্কে" icon="🏪" subtitle="বিশ্বস্ততার সাথে প্রতিটি সেবা" />

      <div className="card-surface rounded-3xl p-6 sm:p-10">
        <h1 className="text-2xl font-extrabold text-brand-900">{settings?.name_bn}</h1>
        <p className="mt-1 font-bold text-gold-600">📍 {settings?.address}</p>
        <p className="mt-5 text-slate-600 leading-relaxed whitespace-pre-line">
          {settings?.description}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl card-glass p-5">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-2 font-extrabold text-brand-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-3xl bg-brand-950 text-white p-6 sm:p-10">
        <h2 className="text-xl font-extrabold">🗂 আমাদের সেবা ক্যাটাগরি</h2>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/services#cat-${c.slug}`}
              className="rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/20 transition-colors"
            >
              {c.icon} {c.name_bn}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-8 py-3.5 font-bold text-white hover:bg-brand-800 transition-colors"
        >
          📞 যোগাযোগ করুন
        </Link>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: '🪪', title: 'সরকারি সেবা', desc: 'পাসপোর্ট, NID, জমি, BMET — সব সরকারি অনলাইন সেবা এক জায়গায়।' },
  { icon: '✈️', title: 'ভিসা ও টিকিট', desc: 'ভিসা আবেদন, বিমান ও রেল টিকিট — দ্রুত ও নির্ভুল।' },
  { icon: '💻', title: 'ডিজিটাল সেবা', desc: 'ওয়েবসাইট, ডোমেইন, হোস্টিং, কম্পোজ, লেমিনেটিংসহ সব ডিজিটাল কাজ।' },
  { icon: '🤝', title: 'সততা ও বিশ্বস্ততা', desc: 'প্রতিটি সেবা সঠিকভাবে সম্পন্ন হয় — কোনো ঝামেলা ছাড়াই।' },
]