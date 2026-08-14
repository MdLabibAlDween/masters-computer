import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="card-surface w-full max-w-md rounded-3xl p-8 text-center">
        <div className="text-5xl">🔍</div>
        <h1 className="mt-4 text-2xl font-extrabold text-brand-900">পেজটি পাওয়া যায়নি</h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          আপনি যে পেজটি খুঁজছেন সেটি নেই বা সরিয়ে ফেলা হয়েছে।
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/"
            className="btn-gold rounded-xl px-6 py-3 font-bold text-brand-950 text-center"
          >
            🏠 হোম পেজে ফিরে যান
          </Link>
          <Link
            href="/services"
            className="rounded-xl border border-brand-200 bg-white px-6 py-3 font-bold text-brand-700 hover:bg-brand-50 transition-colors text-center"
          >
            ⚙️ সেবাসমূহ দেখুন
          </Link>
        </div>
      </div>
    </div>
  )
}
