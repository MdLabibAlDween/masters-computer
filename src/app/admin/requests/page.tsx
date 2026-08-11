import { createClient } from '@/lib/supabase/server'
import InboxManager from '@/components/admin/InboxManager'
import { Card, PageHeader } from '@/components/admin/ui'
import { REQUEST_STATUS_LABELS, REQUEST_STATUSES } from '@/lib/constants'

export const metadata = { title: 'সেবা আবেদন' }

export default async function AdminRequestsPage() {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from('service_requests')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="📩 সেবা আবেদন" subtitle="গ্রাহকদের পাঠানো সেবা আবেদন — স্থিতি আপডেট করুন" />
      <Card>
        <InboxManager
          table="service_requests"
          rows={(requests ?? []) as never[]}
          statusField="status"
          statusOptions={[...REQUEST_STATUSES] as never[]}
          statusLabels={REQUEST_STATUS_LABELS}
          columns={[
            { key: 'service_name', label: 'সেবা' },
            { key: 'preferred_date', label: 'পছন্দের তারিখ' },
            { key: 'preferred_time', label: 'পছন্দের সময়' },
          ]}
        />
      </Card>
    </div>
  )
}