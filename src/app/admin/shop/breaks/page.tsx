import { createClient } from '@/lib/supabase/server'
import CrudManager, { type CrudField } from '@/components/admin/CrudManager'
import { Card, PageHeader } from '@/components/admin/ui'
import { DAYS_BN } from '@/lib/constants'
import { formatTimeBn } from '@/lib/format'

export const metadata = { title: 'বিরতির সময়' }

const FIELDS: CrudField[] = [
  { name: 'day_of_week', label: 'দিন', type: 'weekday', required: true },
  { name: 'start_time', label: 'বিরতি শুরু', type: 'time', required: true },
  { name: 'end_time', label: 'বিরতি শেষ', type: 'time', required: true },
  { name: 'title', label: 'বিরতির নাম', type: 'text' },
]

export default async function ShopBreaksPage() {
  const supabase = await createClient()
  const { data: breaks } = await supabase.from('break_times').select('*').order('day_of_week')

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="☕ বিরতির সময়"
        subtitle="বিরতির সময়ে ওয়েবসাইটে 🟡 সাময়িক বিরতি চলছে দেখাবে। খোলা-বন্ধের হিসাব থেকে বিরতি আপনা-আপনি বাদ যাবে।"
      />
      <Card className="p-5">
        <CrudManager
          table="break_times"
          fields={FIELDS}
          initial={breaks ?? []}
          rowLabel={(r) => `${DAYS_BN[Number(r.day_of_week)]}: ${formatTimeBn(String(r.start_time))} — ${formatTimeBn(String(r.end_time))}`}
        />
      </Card>
    </div>
  )
}