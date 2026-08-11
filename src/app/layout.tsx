import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Bengali, Geist_Mono } from 'next/font/google'
import './globals.css'

const bengali = Noto_Sans_Bengali({
  variable: '--font-masters-sans',
  subsets: ['bengali', 'latin'],
  display: 'swap',
})

const mono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'মাস্টার্স কম্পিউটার — সালথা বাজার, ফরিদপুর',
    template: '%s | মাস্টার্স কম্পিউটার',
  },
  description:
    'অনলাইন আবেদন, টিকিট, ভিসা, NID, জমি সংক্রান্ত সেবা এবং বিভিন্ন ডিজিটাল সেবা। সালথা বাজার, ফরিদপুর।',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-512.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${bengali.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  )
}