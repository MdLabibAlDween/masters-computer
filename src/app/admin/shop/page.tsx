import { createClient } from '@/lib/supabase/server'
import ShopOverrideForm from '@/components/admin/ShopOverrideForm'
import ShopStatusPreview from '@/components/admin/ShopStatusPreview'
import { getSchedule } from '@/lib/data'
import { Card, PageHeader } from '@/components/admin/ui'
import Link from 'next/link'

export const metadata = { title: 'বর্তমান অবস্থা' }

export default async function ShopStatusPage() {
  const supabase = await createClient()
  const schedule = await getSchedule()
  const { data: override } = await supabase
    .from('shop_status_overrides')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="🏪 বর্তমান অবস্থা"
        subtitle="সরকারি সময়সূচি উপেক্ষা করে দোকানের অবস্থা নির্ধারণ করুন"
        action={
          <Link href="/admin/shop/hours" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            🕗 খোলার সময় পরিবর্তন →
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <ShopOverrideForm initial={override} />
        <Card className="p-5 h-fit">
          <div className="text-sm font-bold text-slate-500 mb-3">ওয়েবসাইটে যা দেখাবে (লাইভ)</div>
          <ShopStatusPreview schedule={schedule} />
          <div className="mt-4 text-xs text-slate-400 leading-relaxed">
            সাপ্তাহিক সময়সূচি, বিরতি, ছুটির দিন ও বিশেষ দিন স্বয়ংক্রিয়ভাবে হিসাব হয় (এশিয়া/ঢাকা সময়)।
          </div>
        </Card>
      </div>
    </div>
  )
}