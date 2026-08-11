'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { uploadSiteAsset, deleteSiteAsset } from '@/lib/uploads'
import type { BusinessSettings, SocialLinks } from '@/types/db'
import { Btn, Card, Field, PageHeader, inputCls } from './ui'

export default function BusinessForm({
  initial,
  social,
}: {
  initial: BusinessSettings | null
  social: SocialLinks | null
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    name_bn: initial?.name_bn ?? '',
    name_en: initial?.name_en ?? '',
    tagline: initial?.tagline ?? '',
    description: initial?.description ?? '',
    logo_url: initial?.logo_url ?? '',
    phone: initial?.phone ?? '',
    phone_secondary: initial?.phone_secondary ?? '',
    email: initial?.email ?? '',
    address: initial?.address ?? '',
    maps_url: initial?.maps_url ?? '',
    timezone: initial?.timezone ?? 'Asia/Dhaka',
    facebook: social?.facebook ?? '',
    whatsapp: social?.whatsapp ?? '',
    youtube: social?.youtube ?? '',
    instagram: social?.instagram ?? '',
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadSiteAsset(file, 'logo')
      set('logo_url', url)
    } catch (err) {
      alert(`আপলোড ব্যর্থ: ${(err as Error).message}`)
    } finally {
      setUploading(false)
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const business = {
      name_bn: form.name_bn.trim(),
      name_en: form.name_en.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      logo_url: form.logo_url,
      phone: form.phone.trim(),
      phone_secondary: form.phone_secondary.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      maps_url: form.maps_url.trim(),
      timezone: form.timezone.trim() || 'Asia/Dhaka',
    }
    const socialLinks = {
      facebook: form.facebook.trim(),
      whatsapp: form.whatsapp.trim(),
      youtube: form.youtube.trim(),
      instagram: form.instagram.trim(),
    }
    const [b, s] = await Promise.all([
      supabase.from('business_settings').upsert({ id: 1, ...business }, { onConflict: 'id' }),
      supabase.from('social_links').upsert({ id: 1, ...socialLinks }, { onConflict: 'id' }),
    ])
    setSaving(false)
    if (b.error || s.error) {
      alert(`ব্যর্থ: ${b.error?.message ?? s.error?.message}`)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="🏢 ব্যবসার তথ্য"
        subtitle="ওয়েবসাইটে সর্বত্র এই তথ্যগুলো স্বয়ংক্রিয়ভাবে ব্যবহার হবে"
        action={
          <Btn type="submit" disabled={saving}>
            {saving ? 'সংরক্ষণ হচ্ছে...' : '💾 সংরক্ষণ করুন'}
          </Btn>
        }
      />

      {saved && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-800">
          ✅ সব তথ্য সংরক্ষিত হয়েছে — ওয়েবসাইটে সাথে সাথে আপডেট হবে।
        </div>
      )}

      <Card className="p-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="লোগো" hint="ওয়েবসাইটের হেডার, ফুটার ও অ্যাডমিন প্যানেলে ব্যবহার হবে">
            <div className="flex items-center gap-4">
              <Image
                src={form.logo_url || '/logo.png'}
                alt="লোগো"
                width={64}
                height={64}
                className="h-16 w-16 object-contain rounded-xl border border-slate-200 bg-white"
              />
              <input type="file" accept="image/*" onChange={uploadLogo} disabled={uploading} className="text-sm" />
              {uploading && <span className="text-sm font-semibold text-slate-500">আপলোড হচ্ছে...</span>}
              {form.logo_url && (
                <button type="button" onClick={async () => { await deleteSiteAsset(form.logo_url); set('logo_url', '') }} className="text-xs font-bold text-red-500 hover:underline">
                  ডিফল্ট লোগো ব্যবহার করুন
                </button>
              )}
            </div>
          </Field>
        </div>
        <Field label="ব্যবসার নাম (বাংলা) *">
          <input className={inputCls} value={form.name_bn} onChange={(e) => set('name_bn', e.target.value)} />
        </Field>
        <Field label="ব্যবসার নাম (ইংরেজি)">
          <input className={inputCls} value={form.name_en} onChange={(e) => set('name_en', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="ট্যাগলাইন (হিরো সেকশনে দেখাবে)">
            <input className={inputCls} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="বিস্তারিত বিবরণ (সম্পর্কে সেকশনে দেখাবে)">
            <textarea className={inputCls} rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
        </div>
        <Field label="ফোন *" hint="কল করুন বাটনে এই নম্বর ব্যবহার হবে">
          <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="01XXXXXXXXX" dir="ltr" />
        </Field>
        <Field label="অতিরিক্ত ফোন">
          <input className={inputCls} value={form.phone_secondary} onChange={(e) => set('phone_secondary', e.target.value)} placeholder="01XXXXXXXXX" dir="ltr" />
        </Field>
        <Field label="ই-মেইল">
          <input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} dir="ltr" />
        </Field>
        <Field label="ঠিকানা">
          <input className={inputCls} value={form.address} onChange={(e) => set('address', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="গুগল ম্যাপ লিংক" hint="খালি থাকলে ঠিকানা দিয়ে ম্যাপ তৈরি হবে">
            <input className={inputCls} value={form.maps_url} onChange={(e) => set('maps_url', e.target.value)} placeholder="https://maps.app.goo.gl/..." dir="ltr" />
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-extrabold text-brand-900 mb-4">🔗 সোশ্যাল মিডিয়া</h2>
        <p className="text-sm text-slate-500 mb-4">যে লিংকগুলো দেওয়া থাকবে শুধু সেগুলোই ওয়েবসাইটে দেখাবে।</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facebook">
            <input className={inputCls} value={form.facebook} onChange={(e) => set('facebook', e.target.value)} placeholder="https://facebook.com/..." dir="ltr" />
          </Field>
          <Field label="WhatsApp" hint="ফোন নম্বর বা wa.me লিংক">
            <input className={inputCls} value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="01XXXXXXXXX" dir="ltr" />
          </Field>
          <Field label="YouTube">
            <input className={inputCls} value={form.youtube} onChange={(e) => set('youtube', e.target.value)} placeholder="https://youtube.com/..." dir="ltr" />
          </Field>
          <Field label="Instagram">
            <input className={inputCls} value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="https://instagram.com/..." dir="ltr" />
          </Field>
        </div>
      </Card>

      <div className="flex gap-3">
        <Btn type="submit" disabled={saving}>
          {saving ? 'সংরক্ষণ হচ্ছে...' : '💾 সব সংরক্ষণ করুন'}
        </Btn>
        {saved && <span className="text-sm font-bold text-emerald-600 self-center">✅ সংরক্ষিত</span>}
      </div>
    </form>
  )
}