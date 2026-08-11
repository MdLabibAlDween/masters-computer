import NoticeCard from '@/components/site/NoticeCard'
import SectionHeading from '@/components/site/SectionHeading'
import NoticeTicker from '@/components/site/NoticeTicker'
import { getNotices } from '@/lib/data'
import { NOTICE_TYPES, NOTICE_TYPE_OPTIONS } from '@/lib/constants'

export const metadata = { title: 'নোটিশ ও আপডেট' }

export default async function NoticesPage() {
  const notices = await getNotices()
  const pinned = notices.filter((n) => n.pinned)
  const rest = notices.filter((n) => !n.pinned)

  const grouped: Record<string, typeof notices> = {}
  for (const type of NOTICE_TYPE_OPTIONS) {
    grouped[type] = notices.filter((n) => n.type === type)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SectionHeading title="নোটিশ ও আপডেট" icon="📢" subtitle="দোকানের নতুন ঘোষণা ও আপডেটসমূহ" />
      <div className="mb-8">
        <NoticeTicker notices={notices} />
      </div>

      {pinned.length > 0 && (
        <div className="mb-10 space-y-4">
          <h2 className="text-lg font-extrabold text-gold-600">📌 পিন করা নোটিশ</h2>
          <div className="grid gap-4">
            {pinned.map((n) => (
              <NoticeCard key={n.id} notice={n} />
            ))}
          </div>
        </div>
      )}

      {NOTICE_TYPE_OPTIONS.map((type) => {
        const items = rest.filter((n) => n.type === type)
        if (items.length === 0) return null
        return (
          <div key={type} className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 font-extrabold text-brand-900">
              <span className={`rounded-full px-3 py-1 text-xs ${NOTICE_TYPES[type].badge}`}>
                {NOTICE_TYPES[type].label}
              </span>
              <span className="text-sm text-slate-400">{toBn(items.length)}টি</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((n) => (
                <NoticeCard key={n.id} notice={n} />
              ))}
            </div>
          </div>
        )
      })}

      {notices.length === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-10 text-center text-slate-500">
          বর্তমানে কোনো নোটিশ নেই।
        </div>
      )}
    </div>
  )
}

const BN = '০১২৩৪৫৬৭৮৯'
const toBn = (n: number) => String(n).replace(/[0-9]/g, (d) => BN[Number(d)])