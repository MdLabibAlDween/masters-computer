'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type NavItem = { href: string; label: string; icon: string }

const NAV_GROUPS: { title?: string; items: NavItem[] }[] = [
  {
    items: [{ href: '/admin', label: 'ড্যাশবোর্ড', icon: '📊' }],
  },
  {
    title: 'দোকান ব্যবস্থাপনা',
    items: [
      { href: '/admin/shop', label: 'বর্তমান অবস্থা', icon: '🏪' },
      { href: '/admin/shop/hours', label: 'খোলার সময়', icon: '🕗' },
      { href: '/admin/shop/breaks', label: 'বিরতির সময়', icon: '☕' },
      { href: '/admin/shop/holidays', label: 'ছুটির দিন', icon: '🎉' },
      { href: '/admin/shop/special-days', label: 'বিশেষ দিন', icon: '⭐' },
    ],
  },
  {
    title: 'সেবাসমূহ',
    items: [
      { href: '/admin/services', label: 'সব সেবা', icon: '🛠' },
      { href: '/admin/services/new', label: 'নতুন সেবা', icon: '➕' },
      { href: '/admin/categories', label: 'ক্যাটাগরি', icon: '🗂' },
    ],
  },
  {
    title: 'নোটিশ',
    items: [
      { href: '/admin/notices', label: 'সব নোটিশ', icon: '📢' },
      { href: '/admin/notices/new', label: 'নতুন নোটিশ', icon: '✍️' },
      { href: '/admin/slider', label: 'নোটিশ স্লাইডার', icon: '🎠' },
    ],
  },
  {
    items: [
      { href: '/admin/requests', label: 'সেবা আবেদন', icon: '📩' },
      { href: '/admin/contacts', label: 'যোগাযোগের বার্তা', icon: '✉' },
      { href: '/admin/business', label: 'ব্যবসার তথ্য', icon: '🏢' },
      { href: '/admin/settings', label: 'সেটিংস ও FAQ', icon: '⚙️' },
    ],
  },
]

export default function AdminShell({
  children,
  adminName,
  role,
}: {
  children: React.ReactNode
  adminName: string
  role: string
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col bg-brand-950 text-slate-300 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-brand-900">
          <Image
            src="/logo.png"
            alt="লোগো"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div>
            <div className="font-bold text-white text-sm">মাস্টার্স কম্পিউটার</div>
            <div className="text-[11px] text-brand-300">অ্যাডমিন প্যানেল</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.title && (
                <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-400">
                  {group.title}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-brand-700 text-white'
                          : 'hover:bg-brand-900 hover:text-white'
                      }`}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-brand-900 text-xs">
          <div className="font-bold text-white">{adminName} 👤</div>
          <div className="text-brand-300 mt-0.5">{role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'অ্যাডমিন'}</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-bold text-brand-700 hover:underline">
              ← ওয়েবসাইট দেখুন
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-semibold text-slate-500 hidden sm:block">
              ড্যাশবোর্ড
            </Link>
            <button
              onClick={logout}
              className="rounded-full bg-red-50 border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
            >
              লগআউট
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6">{children}</main>
      </div>

      {/* Mobile bottom sheet nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] overflow-x-auto no-scrollbar">
        <div className="flex min-w-max items-center">
          {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-4 py-2.5 text-[11px] font-bold whitespace-nowrap ${
                  active ? 'text-brand-700 bg-brand-50' : 'text-slate-500'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}