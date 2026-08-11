import Link from 'next/link'
import { notFound } from 'next/navigation'
import RequestForm from '@/components/site/RequestForm'
import NoticeCard from '@/components/site/NoticeCard'
import { getNotices, getServiceBySlug, getServiceDocuments, getServices } from '@/lib/data'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  return {
    title: service?.name_bn ?? 'সেবা',
    description: service?.short_desc,
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [service, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getServices({ includeInactive: true }),
  ])

  if (!service) notFound()

  const docs = Object.values(await getServiceDocuments([service.id]))[0] ?? []
  const relatedNotices = (await getNotices()).filter(
    (n) => n.related_service_id === service.id || n.title.includes(service.name_bn)
  )
  const categoryServices = allServices.filter((s) => s.category_id === service.category_id && s.id !== service.id)

  return (
    <div className="bg-gradient-to-b from-brand-50/70 to-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <nav className="text-xs font-semibold text-slate-400 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-brand-600">হোম</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-brand-600">সেবাসমূহ</Link>
          <span>/</span>
          <span className="text-brand-700">{service.name_bn}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-4xl shrink-0">
                  {service.icon || '🛠'}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-900">
                    {service.name_bn}
                  </h1>
                  <p className="text-sm text-slate-400 font-semibold mt-1">
                    {service.service_categories?.name_bn}
                    {service.featured && <span className="ml-2 text-gold-600">⭐ জনপ্রিয়</span>}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-slate-600 leading-relaxed whitespace-pre-line">
                {service.full_desc || service.short_desc}
              </p>

              {service.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={service.image_url} alt={service.name_bn} className="mt-6 rounded-2xl w-full object-cover" />
              )}
            </div>

            {docs.length > 0 && (
              <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-extrabold text-brand-900">📄 প্রয়োজনীয় কাগজপত্র</h2>
                <ul className="mt-4 space-y-2.5">
                  {docs.map((doc) => (
                    <li key={doc.id} className="flex items-start gap-3 rounded-xl bg-brand-50/60 px-4 py-3">
                      <span className="text-brand-600 font-bold">✔</span>
                      <div>
                        <div className="font-bold text-slate-800">{doc.document_name}</div>
                        {doc.note && <div className="text-sm text-slate-500">{doc.note}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-slate-400 font-medium">
                  প্রয়োজনে অতিরিক্ত কাগজপত্র চাওয়া হতে পারে। সঠিক তালিকার জন্য দোকানে যোগাযোগ করুন।
                </p>
              </div>
            )}

            {service.instructions && (
              <div className="rounded-3xl bg-brand-950 text-white p-6 sm:p-8">
                <h2 className="text-xl font-extrabold">📋 কীভাবে সেবা নেবেন</h2>
                <p className="mt-3 text-brand-100 leading-relaxed whitespace-pre-line">
                  {service.instructions}
                </p>
              </div>
            )}

            {relatedNotices.length > 0 && (
              <div>
                <h2 className="text-xl font-extrabold text-brand-900 mb-4">📢 সংশ্লিষ্ট নোটিশ</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedNotices.slice(0, 4).map((n) => (
                    <NoticeCard key={n.id} notice={n} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-extrabold text-brand-900">📩 সেবা আবেদন করুন</h2>
              <p className="mt-1 mb-5 text-sm text-slate-500">
                নাম ও ফোন নম্বর দিলেই আমরা যোগাযোগ করব।
              </p>
              <RequestForm services={allServices} defaultServiceId={service.id} />
            </div>

            {categoryServices.length > 0 && (
              <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-extrabold text-brand-900 mb-4">
                  {service.service_categories?.name_bn ?? 'একই ক্যাটাগরি'} — আরও সেবা
                </h2>
                <div className="space-y-2">
                  {categoryServices.map((s) => (
                    <Link
                      key={s.id}
                      href={`/services/${s.slug}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-brand-50 transition-colors"
                    >
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-sm font-bold text-slate-700">{s.name_bn}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}