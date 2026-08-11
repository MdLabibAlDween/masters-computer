'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge, Btn, Table } from './ui'

type Row = {
  id: number
  icon: string
  name_bn: string
  name_en: string
  active: boolean
  featured: boolean
  display_order: number
  service_categories: { id: number; name_bn: string } | null
}

export default function ServiceRows({ services }: { services: Row[] }) {  const router = useRouter()
  const [rows, setRows] = useState(services)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function toggle(id: number, patch: { active?: boolean; featured?: boolean }) {
    setBusyId(id)
    const supabase = createClient()
    const { error } = await supabase.from('services').update(patch).eq('id', id)
    setBusyId(null)
    if (error) {
      alert(`ব্যর্থ: ${error.message}`)
      return
    }
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    router.refresh()
  }

  async function remove(id: number, name: string) {
    if (!confirm(`"${name}" সেবাটি মুছবেন? সংশ্লিষ্ট কাগজপত্রও মুছে যাবে।`)) return
    const supabase = createClient()
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) {
      alert(`ব্যর্থ: ${error.message}`)
      return
    }
    setRows((rs) => rs.filter((r) => r.id !== id))
  }

  return (
    <Table
      headers={['সেবা', 'ক্যাটাগরি', 'দৃশ্যমান', 'জনপ্রিয়', 'কর্ম']}
    >
      {rows.map((s) => (
        <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60">
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">{s.icon || '🛠'}</span>
              <div>
                <div className="font-bold text-slate-800">
                  {s.name_bn}
                  {s.featured && <span className="ml-1">⭐</span>}
                </div>
                <div className="text-xs text-slate-400">{s.name_en || '—'}</div>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-sm font-semibold text-slate-500">{s.service_categories?.name_bn ?? '—'}</td>
          <td className="px-4 py-3">
            <button onClick={() => toggle(s.id, { active: !s.active })} disabled={busyId === s.id}>
              {s.active ? <Badge tone="green">দৃশ্যমান</Badge> : <Badge tone="red">লুকানো</Badge>}
            </button>
          </td>
          <td className="px-4 py-3">
            <button onClick={() => toggle(s.id, { featured: !s.featured })} disabled={busyId === s.id}>
              {s.featured ? <Badge tone="gold">জনপ্রিয়</Badge> : <Badge>সাধারণ</Badge>}
            </button>
          </td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <Link href={`/admin/services/${s.id}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                ✏️ সম্পাদনা
              </Link>
              <Btn onClick={() => remove(s.id, s.name_bn)} variant="danger" className="px-3 py-1.5 text-xs">
                🗑
              </Btn>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  )
}