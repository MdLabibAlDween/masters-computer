import ServiceForm from '@/components/admin/ServiceForm'
import { getCategories } from '@/lib/data'

export const metadata = { title: 'নতুন সেবা' }

export default async function NewServicePage() {
  const categories = await getCategories(true)

  return <ServiceForm categories={categories} />
}