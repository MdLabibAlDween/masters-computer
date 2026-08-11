import Link from 'next/link'
import type { ServiceWithCategory } from '@/types/db'

export default function ServiceCard({ service }: { service: ServiceWithCategory }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl group-hover:bg-brand-100 transition-colors">
          {service.icon || '🛠'}
        </div>
        {service.featured && (
          <span className="rounded-full bg-gold-100 text-gold-700 text-[11px] font-bold px-2.5 py-1">
            ⭐ জনপ্রিয়
          </span>
        )}
      </div>
      <h3 className="mt-4 font-bold text-brand-900 group-hover:text-brand-600 transition-colors">
        {service.name_bn}
      </h3>
      <p className="mt-1.5 text-sm text-slate-500 leading-relaxed line-clamp-2">
        {service.short_desc}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">
          {service.service_categories?.name_bn}
        </span>
        <span className="text-brand-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
          বিস্তারিত →
        </span>
      </div>
    </Link>
  )
}