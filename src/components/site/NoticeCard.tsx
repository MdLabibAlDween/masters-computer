import Link from 'next/link'
import { NOTICE_TYPES } from '@/lib/constants'
import { formatDateBn } from '@/lib/format'
import type { Notice } from '@/types/db'

export default function NoticeCard({ notice }: { notice: Notice }) {
  const meta = NOTICE_TYPES[notice.type]
  const related = (notice as Notice & { services?: { slug?: string; name_bn?: string } | null }).services
  const ctaUrl = notice.cta_url || (related ? `/services/${related.slug}` : '')

  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow ${
        notice.pinned ? 'border-gold-300 ring-1 ring-gold-200' : 'border-slate-100'
      }`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.badge}`}>
          {notice.type === 'facility' ? '✨ ' : ''}
          {meta.label}
        </span>
        {notice.pinned && (
          <span className="rounded-full bg-gold-500 text-white text-[11px] font-bold px-2.5 py-1">
            📌 পিন করা
          </span>
        )}
        <span className="text-xs text-slate-400 font-medium ml-auto">
          {formatDateBn(notice.publish_date)}
        </span>
      </div>
      <h3 className="mt-3 font-bold text-brand-900">{notice.title}</h3>
      {notice.description && (
        <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {notice.description}
        </p>
      )}
      {(notice.cta_text || related) && (
        <Link
          href={ctaUrl || '#'}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800 transition-colors"
        >
          {notice.cta_text || related?.name_bn || 'বিস্তারিত'} →
        </Link>
      )}
    </article>
  )
}