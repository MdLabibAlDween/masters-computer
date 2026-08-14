import ServiceCard from '@/components/site/ServiceCard'
import SectionHeading from '@/components/site/SectionHeading'
import { getCategories, getServices } from '@/lib/data'

export const metadata = { title: 'সেবাসমূহ' }

export default async function ServicesPage() {
  const [categories, services] = await Promise.all([getCategories(), getServices()])

  const hasServices = services.length > 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        title="আমাদের সেবাসমূহ"
        icon="🛠"
        subtitle="সব ধরনের অনলাইন সেবা এক জায়গায় — প্রয়োজন অনুযায়ী বেছে নিন"
      />

      {!hasServices && (
        <div className="card-glass rounded-2xl p-10 text-center text-slate-500">
          শীঘ্রই সেবার তালিকা যুক্ত করা হবে। {''}
          <a href="/contact" className="text-brand-600 font-bold underline">যোগাযোগ করুন</a>
        </div>
      )}

      <div className="space-y-12">
        {categories.map((cat) => {
          const catServices = services.filter((s) => s.category_id === cat.id)
          if (catServices.length === 0) return null
          return (
            <section key={cat.id} id={`cat-${cat.slug}`} className="scroll-mt-24">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sage-100 to-sage-200 text-2xl">
                  {cat.icon}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-brand-900">{cat.name_bn}</h2>
                  <p className="text-xs text-slate-400 font-semibold">
                    {cat.name_en} • {toBn(catServices.length)}টি সেবা
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catServices.map((s) => (
                  <ServiceCard key={s.id} service={s} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

const BN = '০১২৩৪৫৬৭৮৯'
const toBn = (n: number) => String(n).replace(/[0-9]/g, (d) => BN[Number(d)])