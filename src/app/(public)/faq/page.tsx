import SectionHeading from '@/components/site/SectionHeading'
import FAQList from '@/components/site/FAQList'
import { getFaqs, getSchedule } from '@/lib/data'

export const metadata = { title: 'প্রশ্নোত্তর' }

export default async function FaqPage() {
  const [faqs, schedule] = await Promise.all([getFaqs(), getSchedule()])

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SectionHeading title="সাধারণ প্রশ্নোত্তর" icon="❓" subtitle="আপনার প্রশ্নের উত্তর খুঁজে নিন" />
      <FAQList faqs={faqs} schedule={schedule} />
    </div>
  )
}