import { createClient } from '@/lib/supabase/server'
import SettingsManager from '@/components/admin/SettingsManager'

export const metadata = { title: 'সেটিংস ও FAQ' }

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: faqs } = await supabase.from('faqs').select('*').order('display_order')

  return <SettingsManager faqs={faqs ?? []} />
}
