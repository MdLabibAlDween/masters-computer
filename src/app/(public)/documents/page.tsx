import Link from 'next/link'
import SectionHeading from '@/components/site/SectionHeading'
import { getServices, getServiceDocuments, getSiteSettings } from '@/lib/data'

export const metadata = { title: 'প্রয়োজনীয় কাগজপত্র' }

export default async function DocumentsPage() {
  const [services, texts] = await Promise.all([
    getServices(),
    getSiteSettings(['documents_note']),
  ])

  const docsByService = await getServiceDocuments(services.map((s) => s.id))
  const withDocs = services.filter((s) => (docsByService[s.id]?.length ?? 0) > 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SectionHeading title="প্রয়োজনীয় কাগজপত্র" icon="📄" subtitle="প্রতিটি সেবার জন্য কী কী কাগজপত্র লাগে" />

      <div className="mb-8 rounded-2xl card-glass border-gold-500/40 px-5 py-4 text-sm font-semibold text-gold-600">
        💡 {texts.documents_note || 'প্রয়োজনীয় কাগজপত্র সেবার ধরন অনুযায়ী পরিবর্তিত হতে পারে।'}
      </div>

      {withDocs.length === 0 && (
        <div className="card-glass rounded-2xl p-10 text-center text-slate-500">
          শীঘ্রই কাগজপত্রের তালিকা যুক্ত হবে।
        </div>
      )}

      <div className="space-y-8">
        {withDocs.map((service) => (
          <div key={service.id} className="card-surface rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl">{service.icon}</span>
              <h2 className="text-lg font-extrabold text-brand-900">{service.name_bn}</h2>
              <Link
                href={`/services/${service.slug}`}
                className="ml-auto rounded-full border border-brand-700 px-4 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50 transition-colors"
              >
                সেবা পেজ →
              </Link>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {docsByService[service.id].map((doc) => (
                <li key={doc.id} className="flex items-start gap-3 rounded-xl card-glass px-4 py-3">
                  <span className="text-brand-600 font-bold">✔</span>
                  <div>
                    <div className="font-bold text-slate-800">{doc.document_name}</div>
                    {doc.note && <div className="text-sm text-slate-500">{doc.note}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}