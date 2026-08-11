'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DAYS_BN } from '@/lib/constants'
import { formatTimeBn } from '@/lib/format'
import { Btn, Empty, inputCls } from './ui'

type FieldType = 'text' | 'time' | 'date' | 'weekday' | 'textarea' | 'checkbox'

export type CrudField = {
  name: string
  label: string
  type: FieldType
  required?: boolean
}

type Row = Record<string, string | number | boolean>

export default function CrudManager({
  table,
  fields,
  initial,
  rowLabel,
}: {
  table: 'break_times' | 'holidays' | 'special_days'
  fields: CrudField[]
  initial: Row[]
  rowLabel: string
}) {
  const [rows, setRows] = useState<Row[]>(initial)
  const [savingId, setSavingId] = useState<number | null>(null)

  function makeEmpty(): Row {    const row: Row = {}
    for (const f of fields) row[f.name] = f.type === 'weekday' ? 0 : ''
    return row
  }

  function setField(row: Row, name: string, value: string | number) {
    setRows((rs) => rs.map((r) => (r === row ? { ...r, [name]: value } : r)))
  }

  function addRow() {
    setRows((rs) => [...rs, makeEmpty()])
  }

  function removeRow(row: Row) {
    setRows((rs) => rs.filter((r) => r !== row))
  }

  async function saveRow(row: Row) {
    const supabase = createClient()
    const payload: Record<string, unknown> = { ...row }
    const id = Number(payload.id ?? 0)
    if (payload.id !== undefined && id > 0) {
      delete payload.id
      setSavingId(id)
      const { error } = await supabase.from(table).update(payload).eq('id', id)
      setSavingId(null)
      if (error) return alert(`ব্যর্থ: ${error.message}`)
      return
    }
    delete payload.id
    setSavingId(-1)
    const { data, error } = await supabase.from(table).insert(payload).select('id').single()
    setSavingId(null)
    if (error || !data) return alert(`ব্যর্থ: ${error?.message ?? 'অজানা'}`)
    setRows((rs) => rs.map((r) => (r === row ? { ...row, id: data.id } : r)))
  }

  async function removeExisting(row: Row) {
    const id = Number(row.id ?? 0)
    if (!id) {
      removeRow(row)
      return
    }
    if (!confirm('নিশ্চিতভাবে মুছবেন?')) return
    const supabase = createClient()
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) return alert(`ব্যর্থ: ${error.message}`)
    removeRow(row)
  }

  return (
    <div>
      {rows.length === 0 ? (
        <Empty text="কোনো এন্ট্রি নেই — নতুন যোগ করুন।" />
      ) : (
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={idx} className="rounded-xl border border-slate-100 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-brand-800">{renderLabel(rowLabel, row, fields)}</span>
                <div className="flex gap-2">
                  {row.id !== undefined && Number(row.id) > 0 ? (
                    <Btn onClick={() => removeExisting(row)} variant="danger" className="py-1.5 px-3 text-xs">
                      🗑 মুছুন
                    </Btn>
                  ) : (
                    <Btn onClick={() => removeRow(row)} variant="ghost" className="py-1.5 px-3 text-xs">
                      বাতিল
                    </Btn>
                  )}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {fields.map((f) => (
                  <div key={f.name} className="sm:col-span-1">
                    <label className="mb-1 block text-xs font-bold text-slate-500">{f.label}</label>
                    {f.type === 'weekday' ? (
                      <select
                        className={inputCls}
                        value={String(row[f.name])}
                        onChange={(e) => setField(row, f.name, Number(e.target.value))}
                      >
                        {DAYS_BN.map((d, i) => (
                          <option key={i} value={i}>
                            {d}
                          </option>
                        ))}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea
                        className={inputCls}
                        rows={1}
                        value={String(row[f.name] ?? '')}
                        onChange={(e) => setField(row, f.name, e.target.value)}
                      />
                    ) : (
                      <input
                        type={f.type}
                        className={inputCls}
                        value={String(row[f.name] ?? '')}
                        onChange={(e) => setField(row, f.name, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <Btn onClick={() => saveRow(row)} disabled={savingId !== null}>
                  {savingId === Number(row.id ?? 0) || (savingId === -1 && row.id === undefined)
                    ? 'সংরক্ষণ হচ্ছে...'
                    : '💾 সংরক্ষণ'}
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-5">
        <Btn onClick={addRow} variant="success">➕ নতুন যোগ করুন</Btn>
      </div>
    </div>
  )
}

function renderLabel(template: string, row: Row, fields: CrudField[]): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_m, name: string) => {
    const v = row[name]
    if (v === undefined || v === null || v === '') return ''
    const f = fields.find((x) => x.name === name)
    if (f?.type === 'weekday') return DAYS_BN[Number(v)] ?? String(v)
    if (f?.type === 'time') return formatTimeBn(String(v))
    return String(v)
  })
}