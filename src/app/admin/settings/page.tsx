import { createClient } from '@/lib/supabase/server'
import SettingsManager from '@/components/admin/SettingsManager'

export const metadata = { title: 'সেটিংস ও FAQ' }

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const [settings, faqs] = await Promise.all([
    supabase.from('site_settings').select('*'),
    supabase.from('faqs').select('*').order('display_order'),
  ])

  return <SettingsManager settings={settings.data ?? []} faqs={faqs.data ?? []} />
}