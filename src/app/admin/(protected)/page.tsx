import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ShopStatusPreview from '@/components/admin/ShopStatusPreview'
import { getSchedule } from '@/lib/data'
import { DAYS_BN } from '@/lib/constants'
import { computeShopStatus } from '@/lib/shop-status'
import { formatTimeBn } from '@/lib/format'
import { Badge, Card } from '@/components/admin/ui'

export const metadata = { title: 'ড্যাশবোর্ড' }

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [schedule, services, notices, requests, facilities] = await Promise.all([
    getSchedule(),
    supabase.from('services').select('id'),
    supabase.from('notices').select('id'),
    supabase.from('service_requests').select('id, status').eq('status', 'new'),
    supabase.from('notices').select('id').eq('type', 'facility'),
  ])

  const status = computeShopStatus(schedule)
  const todayHours =
    schedule.hours.find((h) => h.day_of_week === getDhakaWeekday()) ?? null

  const cards = [
    { label: 'সব সেবা', value: services.data?.length ?? 0, icon: '🛠', href: '/admin/services', tone: 'bg-brand-50 border-brand-200' },
    { label: 'সক্রিয় নোটিশ', value: notices.data?.length ?? 0, icon: '📢', href: '/admin/notices', tone: 'bg-blue-50 border-blue-200' },
    { label: 'নতুন সুবিধা', value: facilities.data?.length ?? 0, icon: '✨', href: '/admin/notices', tone: 'bg-yellow-50 border-yellow-200' },
    { label: 'নতুন আবেদন', value: requests.data?.length ?? 0, icon: '📩', href: '/admin/requests', tone: 'bg-emerald-50 border-emerald-200' },
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-xl sm:text-2xl font-extrabold text-brand-900 mb-6">📊 ড্যাশবোর্ড</h1>

      {/* Shop status */}
      <Card className="p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-500 mb-1">🟢 দোকানের অবস্থা</div>
            <div className="text-xl font-extrabold text-brand-900">
              {status.emoji} {status.label}
            </div>
            {todayHours?.is_open && (
              <div className="mt-1 text-sm text-slate-500 font-semibold">
                আজকের সময়: {formatTimeBn(todayHours.open_time)} — {formatTimeBn(todayHours.close_time)}
              </div>
            )}
            {status.resumeDate && (
              <div className="mt-1 text-sm font-bold text-amber-600">
                পুনরায় চালু: {status.resumeDate}
              </div>
            )}
          </div>
          <Link href="/admin/shop" className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800 transition-colors">
            অবস্থা পরিবর্তন করুন →
          </Link>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow ${c.tone}`}>
            <div className="text-2xl">{c.icon}</div>
            <div className="mt-2 text-2xl font-extrabold text-brand-900">{toBn(c.value)}</div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="text-sm font-bold text-slate-500 mb-3">আজকের খোলার সময়</div>
          {schedule.hours.map((h) => (
            <div key={h.id} className={`flex items-center justify-between py-2 border-b border-slate-50 last:border-0 ${h.day_of_week === getDhakaWeekday() ? 'bg-brand-50/60 rounded-lg px-2' : ''}`}>
              <span className="text-sm font-bold text-slate-700">{DAYS_BN[h.day_of_week]}</span>
              {h.is_open ? (
                <Badge tone="green">
                  {formatTimeBn(h.open_time)} — {formatTimeBn(h.close_time)}
                </Badge>
              ) : (
                <Badge tone="red">বন্ধ</Badge>
              )}
            </div>
          ))}
        </Card>

        <Card className="p-5">
          <div className="text-sm font-bold text-slate-500 mb-3">লাইভ স্ট্যাটাস প্রিভিউ</div>
          <ShopStatusPreview schedule={schedule} />
        </Card>
      </div>
    </div>
  )
}

function getDhakaWeekday(): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', weekday: 'short' }).format(new Date())
  const jsWeekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts)
  return (jsWeekday + 1) % 7
}

const BN = '০১২৩৪৫৬৭৮৯'
const toBn = (n: number) => String(n).replace(/[0-9]/g, (d) => BN[Number(d)])