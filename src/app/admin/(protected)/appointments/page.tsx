import { createClient } from '@/lib/supabase/server'
import InboxManager from '@/components/admin/InboxManager'
import { Card, PageHeader } from '@/components/admin/ui'
import { APPOINTMENT_STATUS_LABELS } from '@/lib/constants'

export const metadata = { title: 'অ্যাপয়েন্টমেন্ট' }

export default async function AdminAppointmentsPage() {
  const supabase = await createClient()
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="📅 অ্যাপয়েন্টমেন্ট" subtitle="গ্রাহকদের অ্যাপয়েন্টমেন্ট — নিশ্চিত বা বাতিল করুন" />
      <Card>
        <InboxManager
          table="appointments"
          rows={(appointments ?? []) as never[]}
          statusField="status"
          statusOptions={['new', 'confirmed', 'completed', 'cancelled'] as never[]}
          statusLabels={APPOINTMENT_STATUS_LABELS}
          columns={[
            { key: 'service_name', label: 'সেবা' },
            { key: 'date', label: 'তারিখ' },
            { key: 'time', label: 'সময়' },
          ]}
          renderExtra={(row) =>
            row.notes ? (
              <p className="mt-2 text-xs font-semibold text-slate-500">
                নোট: {String(row.notes)}
              </p>
            ) : null
          }
        />
      </Card>
    </div>
  )
}