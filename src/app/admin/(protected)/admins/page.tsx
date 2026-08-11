import { createClient } from '@/lib/supabase/server'
import AdminsManager from '@/components/admin/AdminsManager'

export const metadata = { title: 'অ্যাডমিন ইউজার' }

export default async function AdminAdminsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: me } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user?.id ?? '')
    .maybeSingle()
  const { data: admins } = await supabase.from('admin_users').select('*').order('created_at')

  return (
    <AdminsManager initial={admins ?? []} isSuperAdmin={me?.role === 'super_admin'} />
  )
}