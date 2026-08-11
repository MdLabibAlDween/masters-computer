import SectionHeading from '@/components/site/SectionHeading'
import { getBusinessSettings, getSocialLinks } from '@/lib/data'

export const metadata = { title: 'লোকেশন' }

export default async function LocationPage() {
  const [settings, social] = await Promise.all([getBusinessSettings(), getSocialLinks()])

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <SectionHeading title="আমাদের অবস্থান" icon="📍" subtitle="সালথা বাজার, ফরিদপুর" />

      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm min-h-[320px]">
          <iframe
            src={mapEmbedUrl(settings?.maps_url, settings?.address)}
            className="h-full w-full min-h-[320px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="সালথা বাজার, ফরিদপুর"
          />
        </div>

        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col">
          <h2 className="text-xl font-extrabold text-brand-900">{settings?.name_bn}</h2>
          <p className="mt-1 text-slate-500 font-semibold">{settings?.name_en}</p>

          <div className="mt-6 space-y-4 flex-1">
            <div className="flex items-start gap-3 rounded-2xl bg-brand-50/60 p-4">
              <span className="text-xl">🏠</span>
              <div>
                <div className="text-xs font-bold text-slate-400">ঠিকানা</div>
                <div className="font-bold text-slate-800">{settings?.address}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/60 p-4">
              <span className="text-xl">✅</span>
              <div>
                <div className="text-xs font-bold text-slate-400">কীভাবে পৌঁছাবেন</div>
                <div className="text-sm font-semibold text-slate-700">
                  সালথা বাজারে ঢুকলেই মূল বাজারের পাশে আমাদের দোকান পাবেন। বাস বা সিএনজিতে সালথা বাজার নামলেই হবে।
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={settings?.maps_url || mapSearchUrl(settings?.address)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 font-bold text-white hover:bg-brand-800 transition-colors"
            >
              🗺 গুগল ম্যাপে খুলুন
            </a>
            {social?.whatsapp && (
              <a
                href={social.whatsapp.startsWith('http') ? social.whatsapp : `https://wa.me/${social.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700 transition-colors"
              >
                💬 WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function mapEmbedUrl(mapsUrl?: string, address?: string) {
  if (mapsUrl) {
    const m = mapsUrl.match(/@(-?[\d.]+),(-?[\d.]+)/)
    if (m) return `https://maps.google.com/maps?q=${m[1]},${m[2]}&z=16&output=embed`
    const m2 = mapsUrl.match(/[?&]q=([^&]+)/)
    if (m2) return `https://maps.google.com/maps?q=${m2[1]}&z=16&output=embed`
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(address || 'সালথা বাজার, ফরিদপুর')}&t=m&z=15&output=embed&iwloc=near`
}

function mapSearchUrl(address?: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || 'সালথা বাজার, ফরিদপুর')}`
}