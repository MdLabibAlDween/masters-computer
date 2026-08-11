import { createClient } from '@/lib/supabase/server'
import CrudManager, { type CrudField } from '@/components/admin/CrudManager'
import { Card, PageHeader } from '@/components/admin/ui'

export const metadata = { title: 'ছুটির দিন' }

const FIELDS: CrudField[] = [
  { name: 'date', label: 'তারিখ', type: 'date', required: true },
  { name: 'title', label: 'ছুটির নাম', type: 'text', required: true },
  { name: 'description', label: 'বিবরণ', type: 'textarea' },
]

export default async function ShopHolidaysPage() {
  const supabase = await createClient()
  const { data: holidays } = await supabase.from('holidays').select('*').order('date')

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="🎉 ছুটির দিন"
        subtitle="এই দিনগুলোতে ওয়েবসাইটে 🔴 আজ দোকান বন্ধ দেখাবে — সাপ্তাহিক সময়সূচি থাকা সত্ত্বেও।"
      />
      <Card className="p-5">
        <CrudManager
          table="holidays"
          fields={FIELDS}
          initial={holidays ?? []}
          rowLabel="{{date}} — {{title}}"
        />
      </Card>
    </div>
  )
}