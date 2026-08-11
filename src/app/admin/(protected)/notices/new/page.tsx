import NoticeForm from '@/components/admin/NoticeForm'
import { getServices } from '@/lib/data'

export const metadata = { title: 'নতুন নোটিশ' }

export default async function NewNoticePage() {
  const services = await getServices({ includeInactive: true })
  return <NoticeForm services={services} />
}