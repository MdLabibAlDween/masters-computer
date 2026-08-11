import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ServiceForm from '@/components/admin/ServiceForm'
import { getCategories } from '@/lib/data'

export const metadata = { title: 'সেবা সম্পাদনা' }

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const [categories, serviceRes, docsRes] = await Promise.all([
    getCategories(true),
    supabase.from('services').select('*').eq('id', Number(id)).maybeSingle(),
    supabase.from('service_documents').select('*').eq('service_id', Number(id)).order('display_order'),
  ])

  if (!serviceRes.data) notFound()

  return (
    <ServiceForm
      categories={categories}
      initial={serviceRes.data}
      initialDocs={docsRes.data ?? []}
    />
  )
}