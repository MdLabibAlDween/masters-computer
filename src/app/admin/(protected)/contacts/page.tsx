import { createClient } from '@/lib/supabase/server'
import InboxManager from '@/components/admin/InboxManager'
import { Card, PageHeader } from '@/components/admin/ui'
import { CONTACT_STATUS_LABELS } from '@/lib/constants'

export const metadata = { title: 'যোগাযোগের বার্তা' }

export default async function AdminContactsPage() {
  const supabase = await createClient()
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="✉ যোগাযোগের বার্তা" subtitle="কন্টাক্ট ফর্ম থেকে আসা বার্তাসমূহ" />
      <Card>
        <InboxManager
          table="contact_messages"
          rows={(messages ?? []) as never[]}
          statusField="status"
          statusOptions={['new', 'read', 'done'] as never[]}
          statusLabels={CONTACT_STATUS_LABELS}
          columns={[
            { key: 'email', label: 'ই-মেইল' },
            { key: 'phone', label: 'ফোন' },
          ]}
        />
      </Card>
    </div>
  )
}