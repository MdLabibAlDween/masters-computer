import { createClient } from '@/lib/supabase/server'
import BusinessForm from '@/components/admin/BusinessForm'

export const metadata = { title: 'ব্যবসার তথ্য' }

export default async function AdminBusinessPage() {
  const supabase = await createClient()
  const [b, s] = await Promise.all([
    supabase.from('business_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('social_links').select('*').eq('id', 1).maybeSingle(),
  ])

  return <BusinessForm initial={b.data} social={s.data} />
}