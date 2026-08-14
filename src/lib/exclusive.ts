export type ExclusiveService = {
  icon: string
  title: string
  desc: string
  salesWhatsApp: string
  devWhatsApp: string
}

export const BUSINESS_WHATSAPP = '8801712697038'
export const DEVELOPER_WHATSAPP = '8801341739202'

export const EXCLUSIVE: ExclusiveService[] = [
  {
    icon: '🌐',
    title: 'Website Building',
    desc: 'ব্যবসার জন্য আধুনিক, মোবাইল-ফ্রেন্ডলি ওয়েবসাইট তৈরি করে দিই — ডিজাইন থেকে ডোমেইন পর্যন্ত।',
    salesWhatsApp: BUSINESS_WHATSAPP,
    devWhatsApp: DEVELOPER_WHATSAPP,
  },
  {
    icon: '🟢',
    title: 'Domain & Hosting',
    desc: 'কম দামে ডোমেইন রেজিস্ট্রেশন ও ওয়েব হোস্টিং সেবা। আপনার সাইটের জন্য সেরা সমাধান।',
    salesWhatsApp: BUSINESS_WHATSAPP,
    devWhatsApp: DEVELOPER_WHATSAPP,
  },
  {
    icon: '🖥',
    title: 'VPS Hosting',
    desc: 'বড় প্রজেক্টের জন্য দ্রুতগতির VPS সার্ভার সেবা — সেটআপ ও রক্ষণাবেক্ষণসহ।',
    salesWhatsApp: BUSINESS_WHATSAPP,
    devWhatsApp: DEVELOPER_WHATSAPP,
  },
]

export function waLink(number: string, title: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(`আমি "${title}" সেবা সম্পর্কে জানতে চাই।`)}`
}
