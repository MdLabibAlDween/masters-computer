import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// Guard: only an active super_admin may invite new admins.
export async function POST(request: Request) {
  let body: { email?: string; name?: string; role?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const name = body.name?.trim() || 'অ্যাডমিন'
  const role = body.role === 'super_admin' ? 'super_admin' : 'admin'
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 })
  }

  // Verify the caller is an active super_admin
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const { data: me } = await supabase
    .from('admin_users')
    .select('role, active')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!me || !me.active || me.role !== 'super_admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const service = createServiceClient()

  // Reuse an existing auth user if present; otherwise create one.
  const { data: existing } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const found = existing?.users.find((u) => u.email === email)

  let userId: string | null = null
  if (found) {
    userId = found.id
  } else {
    const password = crypto.randomUUID().slice(0, 12) + 'Ab1!'
    const { data, error } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    userId = data.user.id
  }

  const { error: roleError } = await service.from('admin_users').upsert(
    { user_id: userId, name, role },
    { onConflict: 'user_id' }
  )
  if (roleError) return NextResponse.json({ error: roleError.message }, { status: 400 })

  return NextResponse.json({ ok: true, email, role })
}