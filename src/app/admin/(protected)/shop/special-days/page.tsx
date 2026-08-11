import { createClient } from '@/lib/supabase/server'
import CrudManager, { type CrudField } from '@/components/admin/CrudManager'
import { Card, PageHeader } from '@/components/admin/ui'

export const metadata = { title: 'বিশেষ দিন' }

const FIELDS: CrudField[] = [
  { name: 'date', label: 'তারিখ', type: 'date', required: true },
  { name: 'open_time', label: 'খোলার সময়', type: 'time', required: true },
  { name: 'close_time', label: 'বন্ধের সময়', type: 'time', required: true },
  { name: 'reason', label: 'কারণ', type: 'text' },
]

export default async function ShopSpecialDaysPage() {
  const supabase = await createClient()
  const { data: days } = await supabase.from('special_days').select('*').order('date')

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="⭐ বিশেষ দিন"
        subtitle="যেমন শুক্রবার বিশেষ খোলা — এই দিনে সাপ্তাহিক সময়সূচি ও ছুটির দিন উপেক্ষা করে খোলা দেখাবে।"
      />
      <Card className="p-5">
        <CrudManager
          table="special_days"
          fields={FIELDS}
          initial={days ?? []}
          rowLabel="{{date}} — {{open_time}} থেকে {{close_time}}"
        />
      </Card>
    </div>
  )
}