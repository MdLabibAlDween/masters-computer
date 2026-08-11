import Link from 'next/link'
import SectionHeading from '@/components/site/SectionHeading'
import ContactForm from '@/components/site/ContactForm'
import { getBusinessSettings, getSocialLinks } from '@/lib/data'

export const metadata = { title: 'যোগাযোগ' }

export default async function ContactPage() {
  const [settings, social] = await Promise.all([getBusinessSettings(), getSocialLinks()])
  const phone = settings?.phone
  const whatsapp = social?.whatsapp || ''

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <SectionHeading title="যোগাযোগ করুন" icon="📞" subtitle="সেবা নিতে বা যেকোনো প্রয়োজনে যোগাযোগ করুন" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-brand-900">📞 সরাসরি যোগাযোগ</h2>
          <div className="mt-5 space-y-4">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 hover:border-brand-200 hover:bg-brand-50/50 transition-colors"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">☎</span>
                <div>
                  <div className="text-xs font-bold text-slate-400">ফোন (কল করুন)</div>
                  <div className="font-extrabold text-brand-900 text-lg" dir="ltr">{phone}</div>
                </div>
              </a>
            )}
            {settings?.phone_secondary && (
              <a
                href={`tel:${settings.phone_secondary}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 hover:border-brand-200 hover:bg-brand-50/50 transition-colors"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">☎</span>
                <div>
                  <div className="text-xs font-bold text-slate-400">অতিরিক্ত নম্বর</div>
                  <div className="font-extrabold text-brand-900 text-lg" dir="ltr">{settings.phone_secondary}</div>
                </div>
              </a>
            )}
            {settings?.email && (
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 hover:border-brand-200 hover:bg-brand-50/50 transition-colors"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">✉</span>
                <div>
                  <div className="text-xs font-bold text-slate-400">ই-মেইল</div>
                  <div className="font-extrabold text-brand-900 text-lg break-all" dir="ltr">{settings.email}</div>
                </div>
              </a>
            )}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">📍</span>
              <div>
                <div className="text-xs font-bold text-slate-400">ঠিকানা</div>
                <div className="font-extrabold text-brand-900">{settings?.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">⏱</span>
              <div>
                <div className="text-xs font-bold text-slate-400">সময় সূচি</div>
                <div className="font-extrabold text-brand-900">
                  <Link href="/status" className="underline underline-offset-2 hover:text-brand-600">
                    দোকানের বর্তমান অবস্থা দেখুন
                  </Link>
                </div>
              </div>
            </div>
            {whatsapp && (
              <a
                href={whatsapp.startsWith('http') ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 hover:bg-emerald-50 transition-colors"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">💬</span>
                <div>
                  <div className="text-xs font-bold text-emerald-600">WhatsApp</div>
                  <div className="font-extrabold text-emerald-800">মেসেজ পাঠান</div>
                </div>
              </a>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-brand-900">✉ বার্তা পাঠান</h2>
          <p className="mt-1 mb-5 text-sm text-slate-500">ফর্মটি পূরণ করলেই আমরা আপনার সাথে যোগাযোগ করব।</p>
          <ContactForm />
        </div>
      </div>
    </div>
  )
}