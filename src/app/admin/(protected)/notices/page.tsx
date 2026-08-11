import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NoticeRows from '@/components/admin/NoticeRows'
import { Card, PageHeader } from '@/components/admin/ui'

export const metadata = { title: 'সব নোটিশ' }

export default async function AdminNoticesPage() {
  const supabase = await createClient()
  const { data: notices } = await supabase
    .from('notices')
    .select('id, title, type, pinned, published, show_on_homepage, publish_date, created_at')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="📢 সব নোটিশ"
        subtitle="নোটিশ, ঘোষণা ও নতুন সুবিধা পরিচালনা করুন"
        action={
          <Link href="/admin/notices/new" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
            ➕ নতুন নোটিশ
          </Link>
        }
      />
      <Card>
        <NoticeRows notices={notices ?? []} />
      </Card>
    </div>
  )
}