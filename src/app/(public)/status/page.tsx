import ShopStatusCard from '@/components/site/ShopStatusCard'
import SectionHeading from '@/components/site/SectionHeading'
import { getSchedule } from '@/lib/data'
import { DAYS_BN } from '@/lib/constants'
import { formatTimeBn } from '@/lib/format'

export const metadata = { title: 'দোকানের বর্তমান অবস্থা' }

export default async function StatusPage() {
  const schedule = await getSchedule()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SectionHeading title="দোকানের বর্তমান অবস্থা" icon="⏱" subtitle="লাইভ অবস্থা — প্রতি সেকেন্ডে আপডেট হয়" />

      <ShopStatusCard schedule={schedule} variant="page" />

      {/* Weekly schedule */}
      <div className="mt-10 card-surface rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-brand-900">📅 সাপ্তাহিক সময়সূচি</h2>
        <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm min-w-[320px]">
          <thead>
            <tr className="text-left text-slate-400 font-semibold border-b border-slate-100">
              <th className="pb-3">দিন</th>
              <th className="pb-3">খোলা</th>
              <th className="pb-3">সময়</th>
            </tr>
          </thead>
          <tbody>
            {schedule.hours.map((h) => {
              const today = isToday(h.day_of_week)
              return (
                <tr key={h.id} className={`border-b border-slate-50 ${today ? 'bg-brand-50/60' : ''}`}>
                  <td className="py-3 font-bold text-slate-700">
                    {DAYS_BN[h.day_of_week]}
                    {today && (
                      <span className="ml-2 rounded-full bg-brand-700 text-white text-[10px] font-bold px-2 py-0.5">
                        আজ
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {h.is_open ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> খোলা
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-bold text-red-500">
                        <span className="h-2 w-2 rounded-full bg-red-500" /> বন্ধ
                      </span>
                    )}
                  </td>
                  <td className="py-3 font-semibold text-slate-600">
                    {h.is_open
                      ? `${formatTimeBn(h.open_time)} — ${formatTimeBn(h.close_time)}`
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>

        {schedule.breaks.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-slate-700 text-sm mb-2">🟡 বিরতির সময়সূচি</h3>
            <div className="flex flex-wrap gap-2">
              {schedule.breaks.map((b) => (
                <span key={b.id} className="rounded-full bg-yellow-50 border border-yellow-200 px-3 py-1.5 text-xs font-bold text-yellow-800">
                  {DAYS_BN[b.day_of_week]}: {formatTimeBn(b.start_time)} — {formatTimeBn(b.end_time)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {(schedule.holidays.length > 0 || schedule.specialDays.length > 0) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {schedule.holidays.length > 0 && (
            <div className="rounded-3xl card-glass border-red-300/40 p-6">
              <h3 className="font-extrabold text-red-700">🔴 বিশেষ ছুটির দিন</h3>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-red-900">
                {schedule.holidays.map((h) => (
                  <li key={h.id}>
                    {h.date} — {h.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {schedule.specialDays.length > 0 && (
            <div className="rounded-3xl card-glass border-emerald-300/40 p-6">
              <h3 className="font-extrabold text-emerald-700">🟢 বিশেষ খোলার দিন</h3>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-emerald-900">
                {schedule.specialDays.map((s) => (
                  <li key={s.id}>
                    {s.date} — {formatTimeBn(s.open_time)} থেকে {formatTimeBn(s.close_time)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function isToday(dayOfWeek: number) {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', weekday: 'short' }).format(now)
  const jsWeekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts)
  return (jsWeekday + 1) % 7 === dayOfWeek
}