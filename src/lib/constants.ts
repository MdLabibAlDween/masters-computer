export const TIMEZONE = 'Asia/Dhaka' as const

// JS Date.getDay(): 0=Sun..6=Sat  →  our day_of_week: 0=Sat..6=Fri
export const DAYS_BN = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার']

export const NOTICE_TYPES: Record<string, { label: string; badge: string }> = {
  general: { label: 'সাধারণ', badge: 'bg-slate-100 text-slate-700' },
  important: { label: 'গুরুত্বপূর্ণ', badge: 'bg-blue-100 text-blue-700' },
  holiday: { label: 'ছুটির দিন', badge: 'bg-rose-100 text-rose-700' },
  shop_status: { label: 'দোকানের অবস্থা', badge: 'bg-amber-100 text-amber-700' },
  service_update: { label: 'সেবা আপডেট', badge: 'bg-cyan-100 text-cyan-700' },
  new_service: { label: 'নতুন সেবা', badge: 'bg-emerald-100 text-emerald-700' },
  facility: { label: 'নতুন সুবিধা', badge: 'bg-yellow-100 text-yellow-700' },
  emergency: { label: 'জরুরি', badge: 'bg-red-100 text-red-700' },
}

export const NOTICE_TYPE_OPTIONS = [
  'general',
  'important',
  'holiday',
  'shop_status',
  'service_update',
  'new_service',
  'facility',
  'emergency',
] as const

export const REQUEST_STATUSES = ['new', 'contacted', 'processing', 'completed', 'cancelled'] as const
export const REQUEST_STATUS_LABELS: Record<string, string> = {
  new: 'নতুন',
  contacted: 'যোগাযোগ করা হয়েছে',
  processing: 'প্রক্রিয়াধীন',
  completed: 'সম্পন্ন',
  cancelled: 'বাতিল',
}

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  new: 'নতুন',
  confirmed: 'নিশ্চিত',
  completed: 'সম্পন্ন',
  cancelled: 'বাতিল',
}

export const CONTACT_STATUS_LABELS: Record<string, string> = {
  new: 'নতুন',
  read: 'পড়া হয়েছে',
  done: 'সমাধান হয়েছে',
}

export const ADMIN_ROLES = ['super_admin', 'admin'] as const
export const ADMIN_ROLE_LABELS: Record<string, string> = {
  super_admin: 'সুপার অ্যাডমিন',
  admin: 'অ্যাডমিন',
}

export const SITE_NAME = 'মাস্টার্স কম্পিউটার'
export const SITE_ADDRESS = 'সালথা বাজার, ফরিদপুর'