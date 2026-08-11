// Mirror of the Supabase tables (see supabase/schema.sql).
// day_of_week: 0 = Saturday ... 6 = Friday

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type AdminUser = {
  id: string
  user_id: string
  name: string
  role: 'super_admin' | 'admin'
  active: boolean
  created_at: string
}

export type BusinessSettings = {
  id: number
  name_bn: string
  name_en: string
  tagline: string
  description: string
  logo_url: string
  phone: string
  phone_secondary: string
  email: string
  address: string
  maps_url: string
  timezone: string
  updated_at: string
}

export type SocialLinks = {
  id: number
  facebook: string
  whatsapp: string
  youtube: string
  instagram: string
}

export type BusinessHours = {
  id: number
  day_of_week: DayOfWeek
  is_open: boolean
  open_time: string // HH:mm:ss
  close_time: string // HH:mm:ss
}

export type BreakTime = {
  id: number
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  title: string
}

export type Holiday = {
  id: number
  date: string // YYYY-MM-DD
  title: string
  description: string
}

export type SpecialDay = {
  id: number
  date: string
  open_time: string
  close_time: string
  reason: string
}

export type ShopStatusOverride = {
  id: number
  status: 'normal' | 'force_open' | 'force_closed' | 'temp_closed'
  message: string
  resume_date: string | null
}

export type ServiceCategory = {
  id: number
  name_bn: string
  name_en: string
  slug: string
  icon: string
  description: string
  display_order: number
  active: boolean
  featured: boolean
}

export type Service = {
  id: number
  category_id: number | null
  name_bn: string
  name_en: string
  slug: string
  short_desc: string
  full_desc: string
  instructions: string
  icon: string
  image_url: string
  active: boolean
  featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type ServiceWithCategory = Service & {
  categories: Pick<ServiceCategory, 'id' | 'name_bn' | 'slug' | 'icon'> | null
}

export type ServiceDocument = {
  id: number
  service_id: number
  document_name: string
  note: string
  display_order: number
}

export type NoticeType =
  | 'general'
  | 'important'
  | 'holiday'
  | 'shop_status'
  | 'service_update'
  | 'new_service'
  | 'facility'
  | 'emergency'

export type Notice = {
  id: number
  title: string
  type: NoticeType
  description: string
  image_url: string
  related_service_id: number | null
  cta_text: string
  cta_url: string
  publish_date: string
  expiry_date: string | null
  pinned: boolean
  show_on_homepage: boolean
  published: boolean
  created_at: string
}

export type ServiceRequest = {
  id: number
  name: string
  phone: string
  service_id: number | null
  service_name: string
  message: string
  preferred_date: string | null
  preferred_time: string | null
  status: 'new' | 'contacted' | 'processing' | 'completed' | 'cancelled'
  created_at: string
}

export type Appointment = {
  id: number
  name: string
  phone: string
  service_id: number | null
  service_name: string
  date: string
  time: string | null
  notes: string
  status: 'new' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
}

export type ContactMessage = {
  id: number
  name: string
  phone: string
  email: string
  message: string
  status: 'new' | 'read' | 'done'
  created_at: string
}

export type Faq = {
  id: number
  question: string
  answer: string
  link_label: string
  link_url: string
  display_order: number
  active: boolean
}

export type SiteSettings = {
  key: string
  value: string
}