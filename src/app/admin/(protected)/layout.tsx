import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'

export const metadata: Metadata = {
  title: 'অ্যাডমিন প্যানেল',
  robots: { index: false, follow: false },
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, name, role, user_id, active')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin || !admin.active) {
    redirect('/admin/login?denied=1')
  }

  return <AdminShell adminName={admin.name || user.email || ''} role={admin.role}>{children}</AdminShell>
}