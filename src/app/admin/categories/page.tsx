import { createClient } from '@/lib/supabase/server'
import CategoriesManager from '@/components/admin/CategoriesManager'

export const metadata = { title: 'ক্যাটাগরি' }

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('service_categories')
    .select('*')
    .order('display_order')

  return (
    <div className="mx-auto max-w-5xl">
      <CategoriesManager initial={categories ?? []} />
    </div>
  )
}