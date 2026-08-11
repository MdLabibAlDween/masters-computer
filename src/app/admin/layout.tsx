import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'অ্যাডমিন প্যানেল',
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}