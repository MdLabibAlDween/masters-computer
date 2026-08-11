#!/usr/bin/env node
// ---------------------------------------------------------------------
// Creates the FIRST Super Admin account.
// SERVER-ONLY script — uses SUPABASE_SERVICE_ROLE_KEY from .env.local.
// Never run this in the browser; never expose the service role key.
//
// Usage:
//   npm run setup-admin
// =====================================================================
import { readFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function loadEnv(file) {
  const env = {}
  if (!existsSync(file)) return env
  for (const line of readFileSync(file, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return env
}

const env = loadEnv('.env.local')
const url = env.SUPABASE_URL || process.env.SUPABASE_URL
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('✗ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const email = process.argv[2]
const password = process.argv[3]
const name = process.argv[4] || 'Super Admin'

if (!email || !password) {
  console.error('Usage: npm run setup-admin -- <email> <password> [name]')
  process.exit(1)
}
if (password.length < 8) {
  console.error('✗ Password must be at least 8 characters.')
  process.exit(1)
}

const admin = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } })

try {
  const { data: user, error: signUpError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (signUpError) throw signUpError

  const { error: roleError } = await admin
    .from('admin_users')
    .insert({ user_id: user.user.id, name, role: 'super_admin' })

  if (roleError) throw roleError

  console.log(`✔ Super admin created: ${email}`)
  console.log(`  Login at: ${url.replace(/^https?:\/\//, '')}`.replace('supabase', 'your-site') + '/admin')
} catch (err) {
  console.error(`✗ Failed: ${err.message}`)
  process.exit(1)
}