'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge, Btn, Empty, inputCls } from './ui'

type Row = {
  id: number
  [key: string]: string | number | boolean | null
}

export default function InboxManager({
  table,
  rows,
  statusField,
  statusOptions,
  statusLabels,
  columns,
  renderExtra,
}: {
  table: 'service_requests' | 'appointments' | 'contact_messages'
  rows: Row[]
  statusField: string
  statusOptions: string[]
  statusLabels: Record<string, string>
  columns: { key: string; label: string }[]
  renderExtra?: (row: Row) => React.ReactNode
}) {
  const [items, setItems] = useState(rows)

  async function setStatus(row: Row, value: string) {
    const supabase = createClient()
    const { error } = await supabase.from(table).update({ [statusField]: value }).eq('id', row.id)
    if (error) return alert(`ব্যর্থ: ${error.message}`)
    setItems((rs) => rs.map((r) => (r.id === row.id ? { ...r, [statusField]: value } : r)))
  }

  async function remove(row: Row) {
    if (!confirm('নিশ্চিতভাবে মুছবেন?')) return
    const supabase = createClient()
    const { error } = await supabase.from(table).delete().eq('id', row.id)
    if (error) return alert(`ব্যর্থ: ${error.message}`)
    setItems((rs) => rs.filter((r) => r.id !== row.id))
  }

  const toneFor = (v: string) => {
    if (v === 'new') return 'red'
    if (v === 'contacted' || v === 'processing' || v === 'read') return 'amber'
    if (v === 'completed' || v === 'confirmed' || v === 'done') return 'green'
    if (v === 'cancelled') return 'slate'
    return 'slate'
  }

  if (items.length === 0) return <Empty text="কোনো এন্ট্রি নেই।" />

  return (
    <div className="divide-y divide-slate-100">
      {items.map((row) => (
        <div key={row.id} className="p-5 flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-brand-900 text-lg">
                {String(row.name)}
              </span>
              {row.phone && (
                <a href={`tel:${row.phone}`} className="text-sm font-bold text-brand-600 hover:underline" dir="ltr">
                  ☎ {String(row.phone)}
                </a>
              )}
              {row.email && (
                <span className="text-sm text-slate-500" dir="ltr">{String(row.email)}</span>
              )}
              <span className="text-xs text-slate-400 font-semibold ml-auto">
                {formatWhen(String(row.created_at))}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
              {columns.map((c) =>
                row[c.key] !== null && String(row[c.key]) !== '' ? (
                  <span key={c.key} className="rounded-full bg-slate-100 px-3 py-1">
                    {c.label}: {String(row[c.key])}
                  </span>
                ) : null
              )}
            </div>
            {row.message && (
              <p className="mt-3 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 whitespace-pre-line">
                {String(row.message)}
              </p>
            )}
            {renderExtra && renderExtra(row)}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge tone={toneFor(String(row[statusField]))}>
              {statusLabels[String(row[statusField])] ?? String(row[statusField])}
            </Badge>
            <select
              className={`${inputCls} w-40 py-2`}
              value={String(row[statusField])}
              onChange={(e) => setStatus(row, e.target.value)}
            >
              {statusOptions.map((o) => (
                <option key={o} value={o}>
                  {statusLabels[o] ?? o}
                </option>
              ))}
            </select>
            <Btn onClick={() => remove(row)} variant="danger" className="px-3 py-2 text-xs">
              🗑
            </Btn>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatWhen(iso: string) {
  const d = new Date(iso)
  const dhaka = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
  return dhaka
}