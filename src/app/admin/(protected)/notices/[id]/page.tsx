import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NoticeForm from '@/components/admin/NoticeForm'
import { getServices } from '@/lib/data'

export const metadata = { title: 'নোটিশ সম্পাদনা' }

export default async function EditNoticePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const [services, noticeRes] = await Promise.all([
    getServices({ includeInactive: true }),
    supabase.from('notices').select('*').eq('id', Number(id)).maybeSingle(),
  ])

  if (!noticeRes.data) notFound()

  return <NoticeForm initial={noticeRes.data} services={services} />
}