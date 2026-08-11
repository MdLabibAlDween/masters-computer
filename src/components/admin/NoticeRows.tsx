'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NOTICE_TYPES } from '@/lib/constants'
import { formatDateBn } from '@/lib/format'
import { Badge, Btn, Empty, Table } from './ui'

type Row = {
  id: number
  title: string
  type: string
  pinned: boolean
  published: boolean
  show_on_homepage: boolean
  publish_date: string
  created_at: string
}

export default function NoticeRows({ notices }: { notices: Row[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(notices)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function toggle(id: number, patch: { published?: boolean; pinned?: boolean }) {
    setBusyId(id)
    const supabase = createClient()
    const { error } = await supabase.from('notices').update(patch).eq('id', id)
    setBusyId(null)
    if (error) return alert(`ব্যর্থ: ${error.message}`)
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    router.refresh()
  }

  async function remove(id: number, title: string) {
    if (!confirm(`"${title}" নোটিশটি মুছবেন?`)) return
    const supabase = createClient()
    const { error } = await supabase.from('notices').delete().eq('id', id)
    if (error) return alert(`ব্যর্থ: ${error.message}`)
    setRows((rs) => rs.filter((r) => r.id !== id))
  }

  if (rows.length === 0) return <div className="p-5"><Empty text="কোনো নোটিশ নেই।" /></div>

  return (
    <Table headers={['নোটিশ', 'ধরন', 'স্থিতি', 'হোমপেজ', 'তারিখ', 'কর্ম']}>
      {rows.map((n) => (
        <tr key={n.id} className="border-b border-slate-50 hover:bg-slate-50/60">
          <td className="px-4 py-3">
            <div className="font-bold text-slate-800">
              {n.pinned && '📌 '}
              {n.title}
            </div>
          </td>
          <td className="px-4 py-3">
            <Badge tone={toneFor(n.type)}>{NOTICE_TYPES[n.type]?.label ?? n.type}</Badge>
          </td>
          <td className="px-4 py-3">
            <button onClick={() => toggle(n.id, { published: !n.published })} disabled={busyId === n.id}>
              {n.published ? <Badge tone="green">প্রকাশিত</Badge> : <Badge tone="red">ড্রাফট</Badge>}
            </button>
          </td>
          <td className="px-4 py-3 text-sm font-bold text-slate-600">{n.show_on_homepage ? '✓ হ্যাঁ' : '—'}</td>
          <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{formatDateBn(n.publish_date)}</td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <Link href={`/admin/notices/${n.id}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                ✏️
              </Link>
              <Btn onClick={() => remove(n.id, n.title)} variant="danger" className="px-3 py-1.5 text-xs">
                🗑
              </Btn>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  )
}

function toneFor(type: string): string {
  const map: Record<string, string> = {
    important: 'blue',
    holiday: 'red',
    shop_status: 'amber',
    service_update: 'blue',
    new_service: 'green',
    facility: 'gold',
    emergency: 'red',
    general: 'slate',
  }
  return map[type] ?? 'slate'
}