import { createClient } from '@/lib/supabase/server'
import SliderManager from '@/components/admin/SliderManager'

export const metadata = { title: 'নোটিশ স্লাইডার' }

export default async function AdminSliderPage() {
  const supabase = await createClient()
  const { data: notices } = await supabase
    .from('notices')
    .select('id, title, type, pinned, published, show_in_slider, publish_date')
    .order('pinned', { ascending: false })
    .order('publish_date', { ascending: false })
    .order('created_at', { ascending: false })

  return <SliderManager notices={(notices ?? []) as never[]} />
}