import Link from 'next/link'
import NoticeTicker from '@/components/site/NoticeTicker'
import ServiceCard from '@/components/site/ServiceCard'
import NoticeCard from '@/components/site/NoticeCard'
import SectionHeading from '@/components/site/SectionHeading'
import FAQList from '@/components/site/FAQList'
import Hero from '@/components/site/Hero'
import ShopStatusCard from '@/components/site/ShopStatusCard'
import {
  getBusinessSettings,
  getCategories,
  getFaqs,
  getNotices,
  getSchedule,
  getServices,
  getSiteSettings,
} from '@/lib/data'

export const metadata = { title: 'হোম' }

export default async function HomePage() {
  const [settings, schedule, categories, services, faqs, notices, texts] = await Promise.all([
    getBusinessSettings(),
    getSchedule(),
    getCategories(),
    getServices(),
    getFaqs(),
    getNotices({ featuredOnly: true }),
    getSiteSettings(['documents_note', 'home_about_title']),
  ])

  const featuredServices = services.filter((s) => s.featured)
  const popularServices = featuredServices.length > 0 ? featuredServices : services.slice(0, 8)
  const importantNotices = notices.filter((n) => n.type === 'important' || n.type === 'emergency' || n.pinned)
  const facilityNotices = notices.filter((n) => n.type === 'facility')
  const documentsNote = texts.documents_note

  return (
    <div>
      <Hero settings={settings} schedule={schedule} />

      {/* Live shop status */}
      <section className="mx-auto max-w-6xl px-4 -mt-8 relative z-10">
        <div className="max-w-2xl">
          <ShopStatusCard schedule={schedule} variant="section" />
        </div>
      </section>

      <NoticeTicker notices={notices} />

      {/* Important notice */}
      {importantNotices.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 mt-10">
          <div className="grid gap-4 sm:grid-cols-2">
            {importantNotices.slice(0, 2).map((n) => (
              <NoticeCard key={n.id} notice={n} />
            ))}
          </div>
        </section>
      )}

      {/* New facilities */}
      {facilityNotices.length > 0 && (
        <section id="facilities" className="mx-auto max-w-6xl px-4 mt-16">
          <SectionHeading title="নতুন সুবিধা" icon="✨" subtitle="সম্প্রতি যুক্ত হওয়া নতুন সেবা ও সুবিধাসমূহ" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facilityNotices.map((n) => (
              <NoticeCard key={n.id} notice={n} />
            ))}
          </div>
        </section>
      )}

      {/* Popular services */}
      <section className="mx-auto max-w-6xl px-4 mt-16">
        <SectionHeading title="জনপ্রিয় সেবাসমূহ" icon="⭐" subtitle="সবচেয়ে বেশি চাওয়া সেবাগুলো এক নজরে" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularServices.slice(0, 8).map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-8 py-3.5 font-bold text-white hover:bg-brand-800 transition-colors"
          >
            সব সেবা দেখুন →
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gradient-to-b from-brand-50/60 to-white mt-16 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading title="সেবা ক্যাটাগরি" icon="🗂" subtitle="প্রয়োজন অনুযায়ী আপনার সেবা বেছে নিন" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((c) => {
              const count = services.filter((s) => s.category_id === c.id).length
              return (
                <Link
                  key={c.id}
                  href={`/services#cat-${c.slug}`}
                  className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className="text-3xl">{c.icon}</div>
                  <div className="mt-3 font-bold text-brand-900 group-hover:text-brand-600">
                    {c.name_bn}
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-1">
                    {toBn(count)}টি সেবা
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Required documents */}
      <section className="mx-auto max-w-6xl px-4 mt-16">
        <SectionHeading title="প্রয়োজনীয় কাগজপত্র" icon="📄" subtitle={documentsNote} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 9).map((s) => (
            <Link
              key={s.id}
              href={`/services/${s.slug}`}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{s.icon}</span>
                <span className="font-bold text-brand-900">{s.name_bn}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                এই সেবার জন্য কী কী কাগজপত্র লাগবে বিস্তারিত দেখুন →
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 rounded-full border-2 border-brand-700 px-8 py-3 font-bold text-brand-700 hover:bg-brand-50 transition-colors"
          >
            সব কাগজপত্রের তালিকা →
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-6xl px-4 mt-16">
        <div className="grid gap-8 lg:grid-cols-2 items-center rounded-3xl bg-brand-950 text-white p-8 sm:p-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              {texts.home_about_title || 'আমাদের সম্পর্কে'}
            </h2>
            <p className="mt-4 text-brand-100 leading-relaxed whitespace-pre-line">
              {settings?.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 font-bold text-brand-950 hover:bg-gold-400 transition-colors"
              >
                আরও জানুন →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🪪', label: 'পাসপোর্ট ও NID' },
              { icon: '🌾', label: 'জমি সংক্রান্ত' },
              { icon: '🚆', label: 'টিকিট সেবা' },
              { icon: '💻', label: 'ডিজিটাল সেবা' },
            ].map((f) => (
              <div key={f.label} className="rounded-2xl bg-white/10 border border-white/15 p-4 text-center">
                <div className="text-3xl">{f.icon}</div>
                <div className="mt-2 text-sm font-bold">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusive services */}
      <section className="mx-auto max-w-6xl px-4 mt-16">
        <SectionHeading title="বিশেষ সেবাসমূহ" icon="💎" subtitle="ডিজিটাল ও ওয়েব-সম্পর্কিত বিশেষ সেবা" />
        <div className="grid gap-4 sm:grid-cols-3">
          {EXCLUSIVE.map((x) => (
            <div
              key={x.title}
              className="rounded-2xl border-2 border-gold-200 bg-gradient-to-b from-gold-50 to-white p-6 shadow-sm"
            >
              <div className="text-4xl">{x.icon}</div>
              <h3 className="mt-4 text-lg font-extrabold text-brand-900">{x.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{x.desc}</p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800 transition-colors"
              >
                আগ্রহ প্রকাশ করুন →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 mt-16">
        <SectionHeading title="সাধারণ প্রশ্নোত্তর" icon="❓" subtitle="আপনার প্রশ্নের উত্তর এখানে খুঁজে নিন" />
        <FAQList faqs={faqs} schedule={schedule} />
        <div className="mt-8 text-center">
          <Link href="/faq" className="text-brand-600 font-bold hover:underline">
            আরও প্রশ্নোত্তর দেখুন →
          </Link>
        </div>
      </section>

      {/* Location */}
      <section className="mx-auto max-w-6xl px-4 mt-16">
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          <div className="rounded-3xl bg-brand-50 p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-extrabold text-brand-900">📍 আমাদের অবস্থান</h2>
            <p className="mt-3 text-slate-700 font-bold text-lg">{settings?.address}</p>
            <p className="mt-1 text-slate-500 text-sm">সালথা বাজার, ফরিদপুর — সহজেই খুঁজে পাবেন।</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={settings?.maps_url || mapSearchUrl(settings?.address)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 font-bold text-white hover:bg-brand-800 transition-colors"
              >
                🗺 গুগল ম্যাপে দেখুন
              </a>
              <Link
                href="/location"
                className="inline-flex items-center gap-2 rounded-full border-2 border-brand-700 px-6 py-3 font-bold text-brand-700 hover:bg-brand-50 transition-colors"
              >
                বিস্তারিত →
              </Link>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm min-h-[280px]">
            <iframe
              src={mapEmbedUrl(settings?.address)}
              className="h-full w-full min-h-[280px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="সালথা বাজার, ফরিদপুর"
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-6xl px-4 mt-16">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-8">
          <SectionHeading title="যোগাযোগ করুন" icon="📞" subtitle="সেবা নিতে বা জানতে সরাসরি যোগাযোগ করুন" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {settings?.phone && (
              <a href={`tel:${settings.phone}`} className={contactTile}>
                <div className="text-3xl">☎</div>
                <div className="font-bold mt-2">কল করুন</div>
                <div className="text-sm text-slate-500" dir="ltr">{settings.phone}</div>
              </a>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`} className={contactTile}>
                <div className="text-3xl">✉</div>
                <div className="font-bold mt-2">ই-মেইল</div>
                <div className="text-sm text-slate-500 break-all" dir="ltr">{settings.email}</div>
              </a>
            )}
            <div className={contactTile}>
              <div className="text-3xl">📍</div>
              <div className="font-bold mt-2">ঠিকানা</div>
              <div className="text-sm text-slate-500">{settings?.address}</div>
            </div>
            <Link href="/contact" className={`${contactTile} bg-brand-700 text-white hover:bg-brand-800`}>
              <div className="text-3xl">📩</div>
              <div className="font-bold mt-2">বার্তা পাঠান</div>
              <div className="text-sm text-brand-100">কন্টাক্ট ফর্ম খুলুন →</div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

const contactTile =
  'flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center hover:shadow-md transition-shadow'

const EXCLUSIVE = [
  {
    icon: '🌐',
    title: 'Website Building',
    desc: 'ব্যবসার জন্য আধুনিক, মোবাইল-ফ্রেন্ডলি ওয়েবসাইট তৈরি করে দিই — ডিজাইন থেকে ডোমেইন পর্যন্ত।',
  },
  {
    icon: '🟢',
    title: 'Domain & Hosting',
    desc: 'কম দামে ডোমেইন রেজিস্ট্রেশন ও ওয়েব হোস্টিং সেবা। আপনার সাইটের জন্য সেরা সমাধান।',
  },
  {
    icon: '🖥',
    title: 'VPS Hosting',
    desc: 'বড় প্রজেক্টের জন্য দ্রুতগতির VPS সার্ভার সেবা — সেটআপ ও রক্ষণাবেক্ষণসহ।',
  },
]

const BN = '০১২৩৪৫৬৭৮৯'
const toBn = (n: number) => String(n).replace(/[0-9]/g, (d) => BN[Number(d)])

function mapSearchUrl(address?: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || 'সালথা বাজার, ফরিদপুর')}`
}

function mapEmbedUrl(address?: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address || 'সালথা বাজার, ফরিদপুর')}&t=m&z=15&output=embed&iwloc=near`
}