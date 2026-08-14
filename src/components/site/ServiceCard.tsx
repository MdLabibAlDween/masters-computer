import Link from 'next/link'
import type { ServiceWithCategory } from '@/types/db'

function isPopular(service: ServiceWithCategory) {
  return Boolean(service.featured || service.service_categories?.featured)
}

export default function ServiceCard({ service }: { service: ServiceWithCategory }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex flex-col rounded-3xl card-glass p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-500 via-gold-600 to-sage-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sage-100 to-sage-200 text-3xl ring-1 ring-sage-200 group-hover:from-sage-50 group-hover:to-sage-100 transition-colors">
          {service.icon || '🛠'}
        </div>
        {isPopular(service) && (
          <span className="rounded-full bg-gradient-to-r from-gold-400 to-gold-500 text-white text-[11px] font-bold px-2.5 py-1 shadow-sm">
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
      {service.url && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 w-fit ring-1 ring-brand-100">
          🔗 সোর্স লিংক
        </span>
      )}
      <div className="mt-auto pt-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">
          {service.service_categories?.name_bn}
        </span>
        <span className="text-brand-600 text-sm font-bold group-hover:translate-x-1.5 group-hover:text-gold-600 transition-all">
          বিস্তারিত →
        </span>
      </div>
    </Link>
  )
}
