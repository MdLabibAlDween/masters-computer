import Link from 'next/link'
import type { Notice } from '@/types/db'

export default function NoticeTicker({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) return null

  const items = [...notices]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    .slice(0, 6)

  return (
    <div className="overflow-hidden border-y border-gold-500/20 bg-gradient-to-r from-gold-400/15 via-gold-400/5 to-gold-400/15 shadow-inner">
      <div className="mx-auto max-w-6xl px-4 flex items-center gap-3">
        <span className="shrink-0 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 px-3.5 py-1 text-xs font-bold text-white shadow-md shadow-gold-500/30">
          📢 নোটিশ
        </span>
        <div className="overflow-hidden flex-1 py-2">
          <div className="flex gap-10 whitespace-nowrap animate-ticker w-max">
            {items.map((n, i) => (
              <Link key={n.id} href="/notices" className="text-sm font-semibold text-slate-700 hover:text-brand-700">
                {n.title}
                {items.length > 1 && i < items.length - 1 && <span className="ml-10 text-gold-500/70">•</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}