import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import MobileNav from '@/components/site/MobileNav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </>
  )
}