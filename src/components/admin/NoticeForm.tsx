'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadSiteAsset, deleteSiteAsset } from '@/lib/uploads'
import { NOTICE_TYPE_OPTIONS, NOTICE_TYPES } from '@/lib/constants'
import { Btn, Card, Field, inputCls, PageHeader } from './ui'
import type { Notice, ServiceWithCategory } from '@/types/db'

export default function NoticeForm({
  initial,
  services,
}: {
  initial?: Partial<Notice>
  services: ServiceWithCategory[]
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    type: initial?.type ?? 'general',
    description: initial?.description ?? '',
    image_url: initial?.image_url ?? '',
    related_service_id: initial?.related_service_id ? String(initial.related_service_id) : '',
    cta_text: initial?.cta_text ?? '',
    cta_url: initial?.cta_url ?? '',
    publish_date: initial?.publish_date ?? new Date().toISOString().slice(0, 10),
    expiry_date: initial?.expiry_date ?? '',
    pinned: initial?.pinned ?? false,
    show_on_homepage: initial?.show_on_homepage ?? true,
    published: initial?.published ?? true,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadSiteAsset(file, 'notices')
      set('image_url', url)
    } catch (err) {
      alert(`আপলোড ব্যর্থ: ${(err as Error).message}`)
    } finally {
      setUploading(false)
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (form.title.trim().length < 2) {
      alert('নোটিশের শিরোনাম লিখুন।')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const payload = {
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim(),
      image_url: form.image_url,
      related_service_id: form.related_service_id ? Number(form.related_service_id) : null,
      cta_text: form.cta_text.trim(),
      cta_url: form.cta_url.trim(),
      publish_date: form.publish_date || null,
      expiry_date: form.expiry_date || null,
      pinned: form.pinned,
      show_on_homepage: form.show_on_homepage,
      published: form.published,
    }

    const { error } = initial?.id
      ? await supabase.from('notices').update(payload).eq('id', initial.id)
      : await supabase.from('notices').insert(payload)

    setSaving(false)
    if (error) {
      alert(`ব্যর্থ: ${error.message}`)
      return
    }
    router.push('/admin/notices')
    router.refresh()
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title={initial?.id ? '✏️ নোটিশ সম্পাদনা' : '➕ নতুন নোটিশ'}
        action={
          <Btn type="submit" disabled={saving}>
            {saving ? 'সংরক্ষণ হচ্ছে...' : '💾 সংরক্ষণ করুন'}
          </Btn>
        }
      />

      <Card className="p-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="শিরোনাম *">
            <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="যেমন: নতুন সুবিধা যুক্ত হয়েছে" />
          </Field>
        </div>
        <Field label="ধরন">
          <select className={inputCls} value={form.type} onChange={(e) => set('type', e.target.value)}>
            {NOTICE_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {NOTICE_TYPES[t].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="সংশ্লিষ্ট সেবা (ঐচ্ছিক)">
          <select className={inputCls} value={form.related_service_id} onChange={(e) => set('related_service_id', e.target.value)}>
            <option value="">— নেই —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name_bn}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="বিবরণ">
            <textarea className={inputCls} rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
        </div>
        <Field label="CTA টেক্সট (বাটনের লেখা)">
          <input className={inputCls} value={form.cta_text} onChange={(e) => set('cta_text', e.target.value)} placeholder="যেমন: রেল টিকিট সেবা দেখুন" />
        </Field>
        <Field label="CTA লিংক" hint="খালি রাখলে সংশ্লিষ্ট সেবার পেজে যাবে">
          <input className={inputCls} value={form.cta_url} onChange={(e) => set('cta_url', e.target.value)} placeholder="/services/rail-ticket" />
        </Field>
        <Field label="প্রকাশের তারিখ">
          <input type="date" className={inputCls} value={form.publish_date} onChange={(e) => set('publish_date', e.target.value)} />
        </Field>
        <Field label="মেয়াদ শেষের তারিখ" hint="খালি রাখলে মেয়াদ শেষ হয় না">
          <input type="date" className={inputCls} value={form.expiry_date} onChange={(e) => set('expiry_date', e.target.value)} />
        </Field>
        <Field label="নোটিশের ছবি" hint="ঐচ্ছিক">
          <div className="flex items-center gap-3">
            {form.image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={form.image_url} alt="" className="h-16 w-24 rounded-xl object-cover border border-slate-200" />
            )}
            <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} className="text-sm" />
            {uploading && <span className="text-sm font-semibold text-slate-500">আপলোড হচ্ছে...</span>}
            {form.image_url && (
              <button type="button" onClick={async () => { await deleteSiteAsset(form.image_url); set('image_url', '') }} className="text-xs font-bold text-red-500 hover:underline">
                মুছুন
              </button>
            )}
          </div>
        </Field>
      </Card>

      <Card className="p-5 flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <input type="checkbox" checked={form.pinned} onChange={(e) => set('pinned', e.target.checked)} className="accent-gold-500 h-4 w-4" />
          📌 পিন করা
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <input type="checkbox" checked={form.show_on_homepage} onChange={(e) => set('show_on_homepage', e.target.checked)} className="accent-brand-600 h-4 w-4" />
          🏠 হোমপেজে দেখাবে
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} className="accent-emerald-600 h-4 w-4" />
          ✅ প্রকাশিত
        </label>
      </Card>

      <div className="flex gap-3">
        <Btn type="submit" disabled={saving}>
          {saving ? 'সংরক্ষণ হচ্ছে...' : '💾 নোটিশ সংরক্ষণ করুন'}
        </Btn>
        <Btn variant="ghost" onClick={() => router.push('/admin/notices')}>
          বাতিল
        </Btn>
      </div>
    </form>
  )
}