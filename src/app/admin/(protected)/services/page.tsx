import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ServiceRows from '@/components/admin/ServiceRows'
import { Card, Empty, PageHeader } from '@/components/admin/ui'

export const metadata = { title: 'সব সেবা' }

export default async function AdminServicesPage() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('services')
    .select('*, service_categories!services_category_id_fkey(id, name_bn)')
    .order('display_order')

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="🛠 সব সেবা"
        subtitle="সেবা যোগ, সম্পাদনা, লুকানো ও ক্রম পরিবর্তন করুন"
        action={
          <Link href="/admin/services/new" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
            ➕ নতুন সেবা
          </Link>
        }
      />
      <Card>
        {services && services.length > 0 ? (
          <ServiceRows services={services} />
        ) : (
          <div className="p-5">
            <Empty text="কোনো সেবা নেই — নতুন সেবা যোগ করুন।" />
          </div>
        )}
      </Card>
    </div>
  )
}