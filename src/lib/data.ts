import { createClient } from '@/lib/supabase/server'
import type {
  BreakTime,
  BusinessHours,
  BusinessSettings,
  Faq,
  Holiday,
  Notice,
  ServiceCategory,
  ServiceDocument,
  ServiceWithCategory,
  ShopStatusOverride,
  SocialLinks,
  SpecialDay,
} from '@/types/db'

const byOrder = <T extends { display_order: number }>(a: T, b: T) =>
  a.display_order - b.display_order

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  return data
}

export async function getSocialLinks(): Promise<SocialLinks | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('social_links')
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  return data
}

export async function getSchedule() {
  const supabase = await createClient()
  const [hoursRes, breaksRes, holidaysRes, specialRes, overrideRes] = await Promise.all([
    supabase.from('business_hours').select('*').order('day_of_week'),
    supabase.from('break_times').select('*').order('day_of_week'),
    supabase.from('holidays').select('*').order('date'),
    supabase.from('special_days').select('*').order('date'),
    supabase.from('shop_status_overrides').select('*').eq('id', 1).maybeSingle(),
  ])
  return {
    hours: (hoursRes.data ?? []) as BusinessHours[],
    breaks: (breaksRes.data ?? []) as BreakTime[],
    holidays: (holidaysRes.data ?? []) as Holiday[],
    specialDays: (specialRes.data ?? []) as SpecialDay[],
    override: (overrideRes.data as ShopStatusOverride | null) ?? null,
  }
}

export async function getCategories(includeInactive = false): Promise<ServiceCategory[]> {
  const supabase = await createClient()
  let query = supabase.from('service_categories').select('*')
  if (!includeInactive) query = query.eq('active', true)
  const { data } = await query.order('display_order')
  return (data ?? []).sort(byOrder)
}

export async function getServices(options?: {
  featuredOnly?: boolean
  includeInactive?: boolean
}): Promise<ServiceWithCategory[]> {
  const supabase = await createClient()
  let query = supabase
    .from('services')
    .select('*, categories(id, name_bn, slug, icon)')
  if (!options?.includeInactive) query = query.eq('active', true)
  if (options?.featuredOnly) query = query.eq('featured', true)
  const { data } = await query.order('display_order')
  return (data ?? []).sort(byOrder)
}

export async function getServiceBySlug(
  slug: string
): Promise<ServiceWithCategory | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('services')
    .select('*, categories(id, name_bn, slug, icon)')
    .eq('slug', slug)
    .maybeSingle()
  return data
}

export async function getServiceDocuments(serviceIds: number[]): Promise<Record<number, ServiceDocument[]>> {
  if (serviceIds.length === 0) return {}
  const supabase = await createClient()
  const { data } = await supabase
    .from('service_documents')
    .select('*')
    .in('service_id', serviceIds)
    .order('display_order')
  const map: Record<number, ServiceDocument[]> = {}
  for (const doc of data ?? []) {
    ;(map[doc.service_id] ??= []).push(doc)
  }
  return map
}

export async function getNotices(options?: {
  type?: string
  featuredOnly?: boolean
}): Promise<Notice[]> {
  const supabase = await createClient()
  let query = supabase
    .from('notices')
    .select('*, services(id, slug, name_bn)')
    .order('pinned', { ascending: false })
    .order('publish_date', { ascending: false })
    .order('created_at', { ascending: false })
  if (options?.type) query = query.eq('type', options.type)
  if (options?.featuredOnly) query = query.eq('show_on_homepage', true)
  const { data } = await query.limit(50)
  return data ?? []
}

export async function getFaqs(): Promise<Faq[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('faqs')
    .select('*')
    .eq('active', true)
    .order('display_order')
  return data ?? []
}

export async function getSiteSettings(keys: string[]): Promise<Record<string, string>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', keys)
  const map: Record<string, string> = {}
  for (const row of data ?? []) map[row.key] = row.value
  return map
}