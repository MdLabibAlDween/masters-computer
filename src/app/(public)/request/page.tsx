import Link from 'next/link'
import SectionHeading from '@/components/site/SectionHeading'
import RequestForm from '@/components/site/RequestForm'
import { getBusinessSettings, getServices } from '@/lib/data'

export const metadata = { title: 'সেবা আবেদন' }

export default async function RequestPage() {
  const [settings, services] = await Promise.all([getBusinessSettings(), getServices()])

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <SectionHeading title="📩 সেবা আবেদন" subtitle="আপনার প্রয়োজনীয় সেবার জন্য আবেদন করুন — আমরা ফোনে যোগাযোগ করব" />

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="card-surface rounded-3xl p-6 sm:p-8 lg:col-span-3">
          <RequestForm services={services} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card-surface rounded-3xl p-6">
            <h2 className="text-lg font-extrabold text-brand-900 mb-4">কীভাবে কাজ করে?</h2>
            <ol className="space-y-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-extrabold text-white">
                    {toBn(i + 1)}
                  </span>
                  <div>
                    <div className="font-bold text-slate-800">{s.title}</div>
                    <div className="text-sm text-slate-500">{s.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border-2 border-gold-200 bg-gradient-to-b from-gold-50 to-white p-6">
            <h2 className="text-lg font-extrabold text-brand-900">জরুরি দরকার?</h2>
            <p className="mt-2 text-sm text-slate-600">
              সরাসরি ফোন করে জানান, দ্রুত ব্যবস্থা নেওয়া হবে।
            </p>
            <div className="mt-4 space-y-2">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-3 text-sm font-bold text-white hover:bg-brand-800 transition-colors"
                >
                  ☎ <span dir="ltr">{settings.phone}</span>
                </a>
              )}
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 rounded-full border-2 border-brand-700 px-5 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50 transition-colors"
              >
                বার্তা পাঠান →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  { title: 'ফর্মটি পূরণ করুন', desc: 'নাম, ফোন নম্বর ও প্রয়োজনীয় সেবা নির্বাচন করুন।' },
  { title: 'আবেদন জমা দিন', desc: 'আবেদনটি সরাসরি আমাদের কাছে চলে আসে।' },
  { title: 'আমরা যোগাযোগ করব', desc: 'আমাদের টিম ফোনে যোগাযোগ করে সেবার ব্যবস্থা করবে।' },
]

const BN = '০১২৩৪৫৬৭৮৯'
const toBn = (n: number) => String(n).replace(/[0-9]/g, (d) => BN[Number(d)])
