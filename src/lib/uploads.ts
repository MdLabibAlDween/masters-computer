import { createClient } from '@/lib/supabase/client'

// Creates a storage path and returns the public URL for an uploaded file.
// Caller must be an admin (RLS enforces this).
export async function uploadSiteAsset(file: File, folder: string): Promise<string> {
  const supabase = createClient()
  const ext = (file.name.split('.').pop() ?? 'png').toLowerCase()
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('site-assets').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('site-assets').getPublicUrl(path)
  return data.publicUrl
}

export async function deleteSiteAsset(url: string): Promise<void> {
  const match = url.match(/\/site-assets\/(.+)$/)
  if (!match) return
  const supabase = createClient()
  await supabase.storage.from('site-assets').remove([decodeURIComponent(match[1])])
}