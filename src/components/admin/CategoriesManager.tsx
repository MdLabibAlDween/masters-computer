'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ServiceCategory } from '@/types/db'
import { Badge, Btn, Card, Field, PageHeader, Table, inputCls } from './ui'

export default function CategoriesManager({ initial }: { initial: ServiceCategory[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(initial)
  const [newRow, setNewRow] = useState({ name_bn: '', name_en: '', icon: '🛠', slug: '', display_order: rows.length + 1 })
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: string | number) => setNewRow((r) => ({ ...r, [k]: v }))

  async function toggle(id: number, patch: { active?: boolean; featured?: boolean }) {
    const supabase = createClient()
    const { error } = await supabase.from('service_categories').update(patch).eq('id', id)
    if (error) return alert(`ব্যর্থ: ${error.message}`)
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    router.refresh()
  }

  async function remove(id: number, name: string) {
    if (!confirm(`"${name}" ক্যাটাগরি মুছবেন? এর সেবাগুলো ক্যাটাগরি ছাড়া হয়ে যাবে।`)) return
    const supabase = createClient()
    const { error } = await supabase.from('service_categories').delete().eq('id', id)
    if (error) return alert(`ব্যর্থ: ${error.message}`)
    setRows((rs) => rs.filter((r) => r.id !== id))
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (newRow.name_bn.trim().length < 2) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        name_bn: newRow.name_bn.trim(),
        name_en: newRow.name_en.trim(),
        icon: newRow.icon || '🛠',
        slug:
          newRow.slug.trim() ||
          newRow.name_bn.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, ''),
        display_order: Number(newRow.display_order) || rows.length + 1,
      })
      .select('*')
      .single()
    setSaving(false)
    if (error) return alert(`ব্যর্থ: ${error.message}`)
    setRows((rs) => [...rs, data])
    setNewRow({ name_bn: '', name_en: '', icon: '🛠', slug: '', display_order: rows.length + 2 })
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="🗂 সেবা ক্যাটাগরি" subtitle="ক্যাটাগরি যোগ, লুকানো ও জনপ্রিয়করণ" />

      <Card className="p-5 mb-6">
        <form onSubmit={create} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Field label="নাম (বাংলা) *">
              <input className={inputCls} value={newRow.name_bn} onChange={(e) => set('name_bn', e.target.value)} placeholder="যেমন: পাসপোর্ট / NID" />
            </Field>
          </div>
          <div>
            <Field label="আইকন">
              <input className={inputCls} value={newRow.icon} onChange={(e) => set('icon', e.target.value)} />
            </Field>
          </div>
          <div>
            <Field label="ক্রম">
              <input type="number" className={inputCls} value={newRow.display_order} onChange={(e) => set('display_order', Number(e.target.value))} />
            </Field>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              ➕ যোগ করুন
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <Table headers={['ক্যাটাগরি', 'ক্রম', 'দৃশ্যমান', 'জনপ্রিয়', 'কর্ম']}>
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.icon || '🛠'}</span>
                  <div>
                    <div className="font-bold text-slate-800">{c.name_bn}</div>
                    <div className="text-xs text-slate-400">{c.name_en || '—'} • /{c.slug}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-bold text-slate-500">{toBn(c.display_order)}</td>
              <td className="px-4 py-3">
                <button onClick={() => toggle(c.id, { active: !c.active })}>
                  {c.active ? <Badge tone="green">দৃশ্যমান</Badge> : <Badge tone="red">লুকানো</Badge>}
                </button>
              </td>
              <td className="px-4 py-3">
                <button onClick={() => toggle(c.id, { featured: !c.featured })}>
                  {c.featured ? <Badge tone="gold">হ্যাঁ</Badge> : <Badge>না</Badge>}
                </button>
              </td>
              <td className="px-4 py-3">
                <Btn onClick={() => remove(c.id, c.name_bn)} variant="danger" className="px-3 py-1.5 text-xs">
                  🗑
                </Btn>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}

const BN = '০১২৩৪৫৬৭৮৯'
const toBn = (n: number) => String(n).replace(/[0-9]/g, (d) => BN[Number(d)])