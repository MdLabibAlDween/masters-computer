import { createClient } from '@/lib/supabase/server'
import HoursEditor from '@/components/admin/HoursEditor'
import { Card, Empty, PageHeader } from '@/components/admin/ui'

export const metadata = { title: 'খোলার সময়' }

export default async function ShopHoursPage() {
  const supabase = await createClient()
  const { data: hours } = await supabase.from('business_hours').select('*').order('day_of_week')

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="🕗 খোলার সময়"
        subtitle="প্রতিটি দিনের খোলা-বন্ধ ও সময় নির্ধারণ করুন। শুক্রবার ডিফল্টভাবে বন্ধ।"
      />
      <Card className="p-5">
        {hours && hours.length > 0 ? (
          <HoursEditor initial={hours} />
        ) : (
          <Empty text="সময়সূচি পাওয়া যায়নি — supabase/schema.sql ফাইলটি আবার চালান।" />
        )}
      </Card>
    </div>
  )
}