'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BusinessHours } from '@/types/db'
import { DAYS_BN } from '@/lib/constants'
import { inputCls } from './ui'

export default function HoursEditor({ initial }: { initial: BusinessHours[] }) {
  const [rows, setRows] = useState<BusinessHours[]>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(id: number, patch: Partial<BusinessHours>) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('business_hours').upsert(
      rows.map((r) => ({
        id: r.id,
        day_of_week: r.day_of_week,
        is_open: r.is_open,
        open_time: r.open_time.slice(0, 5),
        close_time: r.close_time.slice(0, 5),
      })),
      { onConflict: 'id' }
    )
    setSaving(false)
    if (error) {
      alert(`ব্যর্থ: ${error.message}`)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="px-4 py-3 font-bold text-slate-500">দিন</th>
              <th className="px-4 py-3 font-bold text-slate-500">খোলা/বন্ধ</th>
              <th className="px-4 py-3 font-bold text-slate-500">খোলার সময়</th>
              <th className="px-4 py-3 font-bold text-slate-500">বন্ধের সময়</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-50">
                <td className="px-4 py-3 font-bold text-slate-700">{DAYS_BN[row.day_of_week]}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => update(row.id, { is_open: !row.is_open })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      row.is_open ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        row.is_open ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="time"
                    disabled={!row.is_open}
                    className={`${inputCls} w-32 disabled:bg-slate-100 disabled:text-slate-400`}
                    value={row.open_time.slice(0, 5)}
                    onChange={(e) => update(row.id, { open_time: `${e.target.value}:00` })}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="time"
                    disabled={!row.is_open}
                    className={`${inputCls} w-32 disabled:bg-slate-100 disabled:text-slate-400`}
                    value={row.close_time.slice(0, 5)}
                    onChange={(e) => update(row.id, { close_time: `${e.target.value}:00` })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'সংরক্ষণ হচ্ছে...' : '💾 সংরক্ষণ করুন'}
        </button>
        {saved && <span className="ml-3 text-sm font-bold text-emerald-600">✅ সংরক্ষিত হয়েছে</span>}
      </div>
    </div>
  )
}