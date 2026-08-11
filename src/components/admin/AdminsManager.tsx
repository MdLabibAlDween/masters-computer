'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AdminUser } from '@/types/db'
import { ADMIN_ROLE_LABELS } from '@/lib/constants'
import { Badge, Btn, Card, Field, PageHeader, Table, inputCls } from './ui'

export default function AdminsManager({ initial, isSuperAdmin }: { initial: AdminUser[]; isSuperAdmin: boolean }) {
  const [rows, setRows] = useState(initial)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin')
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    setStatus('')
    setSending(true)
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setStatus(`✗ ${json.error ?? 'ব্যর্থ'}`)
        setSending(false)
        return
      }
      setStatus('✅ অ্যাডমিন যোগ হয়েছে। এই ইউজার প্রথমবার লগইন করতে পারবে না — প্রথমবার "পাসওয়ার্ড ভুলে গেছেন?" দিয়ে পাসওয়ার্ড সেট করুন।')
      setEmail('')
      setName('')
      setSending(false)
    } catch {
      setStatus('✗ নেটওয়ার্ক সমস্যা')
      setSending(false)
    }
  }

  async function toggleActive(userId: string, active: boolean) {
    const supabase = createClient()
    const { error } = await supabase.from('admin_users').update({ active }).eq('user_id', userId)
    if (error) return alert(`ব্যর্থ: ${error.message}`)
    setRows((rs) => rs.map((r) => (r.user_id === userId ? { ...r, active } : r)))
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="👥 অ্যাডমিন ইউজার" subtitle="অ্যাডমিন প্যানেলে কে প্রবেশ করবে তা নিয়ন্ত্রণ করুন" />

      {isSuperAdmin && (
        <Card className="p-5 mb-6">
          <h2 className="text-lg font-extrabold text-brand-900 mb-4">➕ নতুন অ্যাডমিন যুক্ত করুন</h2>
          <form onSubmit={invite} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Field label="নাম">
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="নাম" />
              </Field>
            </div>
            <div className="lg:col-span-1">
              <Field label="ই-মেইল *">
                <input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" dir="ltr" />
              </Field>
            </div>
            <div>
              <Field label="ভূমিকা">
                <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'super_admin')}>
                  <option value="admin">অ্যাডমিন</option>
                  <option value="super_admin">সুপার অ্যাডমিন</option>
                </select>
              </Field>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={sending} className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {sending ? 'যোগ হচ্ছে...' : '➕ যুক্ত করুন'}
              </button>
            </div>
          </form>
          {status && <p className="mt-4 text-sm font-semibold text-slate-600 whitespace-pre-line">{status}</p>}
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            সুপার অ্যাডমিন নতুন অ্যাডমিন যুক্ত করার অনুমতি রাখে। নতুন ইউজারের জন্য পাসওয়ার্ড সেট করতে হবে — অ্যাডমিন প্যানেলে
            &ldquo;পাসওয়ার্ড ভুলে গেছেন?&rdquo; লিংক ব্যবহার করুন।
          </p>
        </Card>
      )}

      <Card>
        <Table headers={['নাম', 'ই-মেইল', 'ভূমিকা', 'স্থিতি', 'কর্ম']}>
          {rows.map((a) => (
            <tr key={a.user_id} className="border-b border-slate-50">
              <td className="px-4 py-3 font-bold text-slate-800">{a.name || '—'}</td>
              <td className="px-4 py-3 text-sm text-slate-500" dir="ltr">{a.user_id}</td>
              <td className="px-4 py-3">
                <Badge tone={a.role === 'super_admin' ? 'gold' : 'blue'}>{ADMIN_ROLE_LABELS[a.role]}</Badge>
              </td>
              <td className="px-4 py-3">
                {a.active ? <Badge tone="green">সক্রিয়</Badge> : <Badge tone="red">নিষ্ক্রিয়</Badge>}
              </td>
              <td className="px-4 py-3">
                {isSuperAdmin && a.role !== 'super_admin' && (
                  <Btn onClick={() => toggleActive(a.user_id, !a.active)} variant="ghost" className="px-3 py-1.5 text-xs">
                    {a.active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                  </Btn>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}