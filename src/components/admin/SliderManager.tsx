'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NOTICE_TYPES } from '@/lib/constants'
import { Badge, Btn, Card, Empty, Field, inputCls, PageHeader } from './ui'

type Row = {
  id: number
  title: string
  type: string
  pinned: boolean
  published: boolean
  show_in_slider: boolean
  publish_date: string
}

export default function SliderManager({ notices }: { notices: Row[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(notices)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [newText, setNewText] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [adding, setAdding] = useState(false)

  const selected = rows.filter((r) => r.show_in_slider && r.published)

  async function toggle(id: number) {
    setBusyId(id)
    const supabase = createClient()
    const row = rows.find((r) => r.id === id)
    if (!row) return
    const next = !row.show_in_slider
    const { error } = await supabase.from('notices').update({ show_in_slider: next }).eq('id', id)
    setBusyId(null)
    if (error) return alert(`ব্যর্থ: ${error.message}`)
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, show_in_slider: next } : r)))
    router.refresh()
  }

  async function addText(e: React.FormEvent) {
    e.preventDefault()
    const text = newText.trim()
    if (text.length < 2) {
      alert('টেক্সট লিখুন।')
      return
    }
    setAdding(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notices')
      .insert({
        title: text,
        type: 'general',
        description: '',
        image_url: '',
        related_service_id: null,
        cta_text: '',
        cta_url: newUrl.trim(),
        publish_date: new Date().toISOString().slice(0, 10),
        expiry_date: null,
        pinned: false,
        show_in_slider: true,
        show_on_homepage: false,
        published: true,
      })
      .select('id, title, type, pinned, published, show_in_slider, publish_date')
      .single()
    setAdding(false)
    if (error) return alert(`ব্যর্থ: ${error.message}`)
    setRows((rs) => [data as unknown as Row, ...rs])
    setNewText('')
    setNewUrl('')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="🎠 নোটিশ স্লাইডার"
        subtitle="হোমপেজের স্লাইডারে কোন নোটিশ দেখাবে — শুধু এখানে চালু করা নোটিশগুলোই স্লাইডারে দেখাবে"
      />

      {/* Add manual text to slider */}
      <Card className="p-5">
        <h2 className="text-lg font-extrabold text-brand-900 mb-1">✍️ স্লাইডারে টেক্সট যোগ করুন</h2>
        <p className="text-sm text-slate-500 mb-4">যেকোনো ঘোষণা/বার্তা লিখে সরাসরি স্লাইডারে দেখান</p>
        <form onSubmit={addText} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
          <Field label="টেক্সট *">
            <input
              className={inputCls}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="যেমন: কাল ১০টা থেকে নতুন ভিসা সেবা শুরু হবে"
            />
          </Field>
          <Field label="লিংক (ঐচ্ছিক)">
            <input
              className={inputCls}
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="/services/... বা https://..."
              dir="ltr"
            />
          </Field>
          <Btn type="submit" variant="success" disabled={adding}>
            {adding ? 'যোগ হচ্ছে...' : '➕ স্লাইডারে যোগ করুন'}
          </Btn>
        </form>
      </Card>

      {/* Current slider preview */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-500 mb-3">বর্তমান স্লাইডার প্রিভিউ ({toBn(selected.length)}টি)</h2>
        {selected.length === 0 ? (
          <Empty text="স্লাইডারে কোনো নোটিশ নেই — নিচের তালিকা থেকে চালু করুন।" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((n) => (
              <span key={n.id} className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
                {n.pinned ? '📌 ' : ''}{n.title}
              </span>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-slate-400 font-semibold">
          ক্রম: পিন করা নোটিশ আগে, তারপর প্রকাশের তারিখ অনুযায়ী (সর্বশেষ আগে)। সর্বোচ্চ ৮টি দেখাবে।
        </p>
      </Card>

      {/* All notices with slider toggle */}
      <Card className="p-0">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-brand-900">সব নোটিশ — স্লাইডার নিয়ন্ত্রণ</h2>
          <p className="text-sm text-slate-500 mt-0.5">প্রতিটি নোটিশের পাশের বাটনে ক্লিক করে স্লাইডারে যুক্ত/বাদ দিন</p>
        </div>
        {rows.length === 0 ? (
          <div className="p-5"><Empty text="কোনো নোটিশ নেই।" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((n) => (
              <div key={n.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-800 truncate">
                    {n.pinned && '📌 '}
                    {n.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge tone={toneFor(n.type)}>{NOTICE_TYPES[n.type]?.label ?? n.type}</Badge>
                    {!n.published && <Badge tone="red">ড্রাফট</Badge>}
                  </div>
                </div>
                <button
                  onClick={() => toggle(n.id)}
                  disabled={busyId === n.id}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                    n.show_in_slider
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {busyId === n.id ? '...' : n.show_in_slider ? '🎠 স্লাইডারে আছে' : 'স্লাইডারে যোগ করুন'}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
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

const BN = '০১২৩৪৫৬৭৮৯'
const toBn = (n: number) => String(n).replace(/[0-9]/g, (d) => BN[Number(d)])