'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadSiteAsset, deleteSiteAsset } from '@/lib/uploads'
import { slugifyAny } from '@/lib/slug'
import type { ServiceCategory, ServiceDocument } from '@/types/db'
import { Btn, Card, Field, inputCls, PageHeader } from './ui'

type Doc = { id?: number; document_name: string; note: string; display_order: number; deleted?: boolean }

export default function ServiceForm({
  categories,
  initial,
  initialDocs,
}: {
  categories: ServiceCategory[]
  initial?: Partial<{
    id: number
    name_bn: string
    name_en: string
    slug: string
    category_id: number | null
    icon: string
    short_desc: string
    full_desc: string
    instructions: string
    image_url: string
    url: string
    active: boolean
    featured: boolean
    display_order: number
  }>
  initialDocs?: ServiceDocument[]
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    name_bn: initial?.name_bn ?? '',
    name_en: initial?.name_en ?? '',
    slug: initial?.slug ?? '',
    category_id: initial?.category_id ? String(initial.category_id) : '',
    icon: initial?.icon ?? '🛠',
    short_desc: initial?.short_desc ?? '',
    full_desc: initial?.full_desc ?? '',
    instructions: initial?.instructions ?? '',
    image_url: initial?.image_url ?? '',
    url: initial?.url ?? '',
    active: initial?.active ?? true,
    featured: initial?.featured ?? false,
    display_order: initial?.display_order ?? 0,
  })
  const [docs, setDocs] = useState<Doc[]>(initialDocs ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: string | boolean | number) => setForm((f) => ({ ...f, [k]: v }))

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadSiteAsset(file, 'services')
      set('image_url', url)
    } catch (err) {
      alert(`আপলোড ব্যর্থ: ${(err as Error).message}`)
    } finally {
      setUploading(false)
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (form.name_bn.trim().length < 2) {
      alert('সেবার নাম বাংলায় লিখুন।')
      return
    }
    setSaving(true)
    const supabase = createClient()

    let slug = form.slug.trim()
    if (!slug) {
      slug = slugifyAny(form.name_en.trim() || form.name_bn.trim())
    }
    let uniqueSlug = slug
    for (let i = 2; ; i++) {
      const { data: clash, error: clashError } = await supabase
        .from('services')
        .select('id')
        .eq('slug', uniqueSlug)
        .neq('id', initial?.id ?? -1)
        .maybeSingle()
      if (clashError || !clash) break
      uniqueSlug = `${slug}-${i}`
    }

    const payload = {
      name_bn: form.name_bn.trim(),
      name_en: form.name_en.trim(),
      slug: uniqueSlug,
      category_id: form.category_id ? Number(form.category_id) : null,
      icon: form.icon || '🛠',
      short_desc: form.short_desc.trim(),
      full_desc: form.full_desc.trim(),
      instructions: form.instructions.trim(),
      image_url: form.image_url,
      url: form.url.trim(),
      active: form.active,
      featured: form.featured,
      display_order: Number(form.display_order) || 0,
    }

    let serviceId = initial?.id
    if (serviceId) {
      const { error } = await supabase.from('services').update(payload).eq('id', serviceId)
      if (error) {
        setSaving(false)
        alert(`ব্যর্থ: ${error.message}`)
        return
      }
    } else {
      const { data, error } = await supabase.from('services').insert(payload).select('id').single()
      if (error || !data) {
        setSaving(false)
        alert(`ব্যর্থ: ${error?.message ?? 'অজানা'}`)
        return
      }
      serviceId = data.id
    }

    // documents
    const removed = docs.filter((d) => d.deleted && d.id)
    if (removed.length > 0) {
      await supabase.from('service_documents').delete().in('id', removed.map((d) => d.id!))
    }
    const kept = docs.filter((d) => !d.deleted)
    for (let i = 0; i < kept.length; i++) {
      const d = kept[i]
      const docPayload = {
        service_id: serviceId,
        document_name: d.document_name,
        note: d.note,
        display_order: i + 1,
      }
      if (d.id) {
        await supabase.from('service_documents').update(docPayload).eq('id', d.id)
      } else {
        await supabase.from('service_documents').insert(docPayload)
      }
    }

    setSaving(false)
    router.push('/admin/services')
    router.refresh()
  }

  function setDoc(idx: number, patch: Partial<Doc>) {
    setDocs((ds) => ds.map((d, i) => (i === idx ? { ...d, ...patch } : d)))
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title={initial?.id ? '✏️ সেবা সম্পাদনা' : '➕ নতুন সেবা'}
        action={
          <Btn type="submit" disabled={saving}>
            {saving ? 'সংরক্ষণ হচ্ছে...' : '💾 সংরক্ষণ করুন'}
          </Btn>
        }
      />

      <Card className="p-5 grid gap-4 sm:grid-cols-2">
        <Field label="সেবার নাম (বাংলা) *">
          <input className={inputCls} value={form.name_bn} onChange={(e) => set('name_bn', e.target.value)} placeholder="যেমন: পাসপোর্টের আবেদন" />
        </Field>
        <Field label="সেবার নাম (ইংরেজি)">
          <input className={inputCls} value={form.name_en} onChange={(e) => set('name_en', e.target.value)} placeholder="Passport Application" />
        </Field>
        <Field label="URL স্লাগ" hint="খালি রাখলে নাম থেকে নিজে তৈরি হবে। যেমন: passport-application">
          <input className={inputCls} value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="passport-application" />
        </Field>
        <Field label="ক্যাটাগরি">
          <select className={inputCls} value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
            <option value="">— ক্যাটাগরি নির্বাচন —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name_bn}
              </option>
            ))}
          </select>
        </Field>
        <Field label="আইকন (ইমোজি)" hint="যেমন: 🪪 ✈️ 🌾">
          <input className={inputCls} value={form.icon} onChange={(e) => set('icon', e.target.value)} />
        </Field>
        <Field label="ক্রম (ছোট = আগে)">
          <input type="number" className={inputCls} value={form.display_order} onChange={(e) => set('display_order', Number(e.target.value))} />
        </Field>
      </Card>

      <Card className="p-5 space-y-4">
        <Field label="সংক্ষিপ্ত বিবরণ (কার্ডে দেখাবে)">
          <textarea className={inputCls} rows={2} value={form.short_desc} onChange={(e) => set('short_desc', e.target.value)} />
        </Field>
        <Field label="URL / সোর্স লিংক" hint="ঐচ্ছিক — কার্ডে 🔗 সোর্স লিংক এবং সেবার পাতায় এমবেড করা হবে। যেমন: https://passport.gov.bd">
          <input
            type="url"
            className={inputCls}
            value={form.url}
            onChange={(e) => set('url', e.target.value)}
            placeholder="https://example.gov.bd"
            dir="ltr"
          />
        </Field>
        <Field label="বিস্তারিত বিবরণ">
          <textarea className={inputCls} rows={4} value={form.full_desc} onChange={(e) => set('full_desc', e.target.value)} />
        </Field>
        <Field label="নিয়ম-নির্দেশনা (কীভাবে সেবা নেবেন)">
          <textarea className={inputCls} rows={3} value={form.instructions} onChange={(e) => set('instructions', e.target.value)} />
        </Field>
        <Field label="সেবার ছবি" hint="ঐচ্ছিক — Supabase স্টোরেজে আপলোড হয়">
          <div className="flex items-center gap-3">
            {form.image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={form.image_url} alt="" className="h-16 w-16 rounded-xl object-cover border border-slate-200" />
            )}
            <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} className="text-sm" />
            {uploading && <span className="text-sm font-semibold text-slate-500">আপলোড হচ্ছে...</span>}
            {form.image_url && (
              <button
                type="button"
                onClick={async () => {
                  await deleteSiteAsset(form.image_url)
                  set('image_url', '')
                }}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                ছবি মুছুন
              </button>
            )}
          </div>
        </Field>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="accent-emerald-600 h-4 w-4" />
            সক্রিয় (ওয়েবসাইটে দেখাবে)
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="accent-gold-500 h-4 w-4" />
            ⭐ জনপ্রিয় (হোমপেজে দেখাবে)
          </label>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-brand-900">📄 প্রয়োজনীয় কাগজপত্র</h2>
          <Btn onClick={() => setDocs((ds) => [...ds, { document_name: '', note: '', display_order: ds.length + 1 }])} variant="success">
            ➕ কাগজ যোগ
          </Btn>
        </div>
        {docs.length === 0 ? (
          <p className="text-sm text-slate-400 font-semibold">কোনো কাগজপত্র নেই।</p>
        ) : (
          <div className="space-y-3">
            {docs.map((d, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-100 p-3">
                <div className="flex-1 min-w-[180px]">
                  <label className="mb-1 block text-xs font-bold text-slate-500">কাগজের নাম *</label>
                  <input className={inputCls} value={d.document_name} onChange={(e) => setDoc(i, { document_name: e.target.value })} placeholder="যেমন: NID" />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="mb-1 block text-xs font-bold text-slate-500">নোট (ঐচ্ছিক)</label>
                  <input className={inputCls} value={d.note} onChange={(e) => setDoc(i, { note: e.target.value })} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (d.id) setDoc(i, { deleted: true })
                    else setDocs((ds) => ds.filter((_, j) => j !== i))
                  }}
                  className={`text-xs font-bold px-3 py-2.5 rounded-xl border ${d.deleted ? 'border-amber-300 text-amber-600 bg-amber-50' : 'border-red-200 text-red-500 hover:bg-red-50'}`}
                >
                  {d.deleted ? '↩ ফিরিয়ে নিন' : '🗑 মুছুন'}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex gap-3">
        <Btn type="submit" disabled={saving}>
          {saving ? 'সংরক্ষণ হচ্ছে...' : '💾 সেবা সংরক্ষণ করুন'}
        </Btn>
        <Btn variant="ghost" onClick={() => router.push('/admin/services')}>
          বাতিল
        </Btn>
      </div>
    </form>
  )
}