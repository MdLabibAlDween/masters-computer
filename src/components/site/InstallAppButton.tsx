'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallAppButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setDeferred(null)
      setInstalled(true)
      setShowGuide(false)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt()
      const choice = await deferred.userChoice
      if (choice.outcome === 'accepted') setDeferred(null)
      return
    }
    setShowGuide(true)
  }

  const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isSafari = typeof navigator !== 'undefined' && /safari/i.test(navigator.userAgent) && !isIOS

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500/15 border border-gold-400/40 px-6 py-3 font-bold text-gold-300 hover:bg-gold-500/25 hover:-translate-y-0.5 transition-all"
      >
        📲 অ্যাপ ইনস্টল করুন
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-950/70 backdrop-blur-sm p-4"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-extrabold text-brand-900">📲 অ্যাপ ইনস্টল করুন</h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-4 space-y-3 text-sm text-slate-700 font-medium">
                <li className="flex gap-2"><span className="font-extrabold text-brand-700">১.</span> সাফারিতে শেয়ার বাটনে (⤴) ট্যাপ করুন</li>
                <li className="flex gap-2"><span className="font-extrabold text-brand-700">২.</span> “হোম স্ক্রিনে যোগ করুন” সিলেক্ট করুন</li>
                <li className="flex gap-2"><span className="font-extrabold text-brand-700">৩.</span> “যোগ করুন” চাপুন — অ্যাপ হোম স্ক্রিনে চলে আসবে</li>
              </ol>
            ) : isSafari ? (
              <ol className="mt-4 space-y-3 text-sm text-slate-700 font-medium">
                <li className="flex gap-2"><span className="font-extrabold text-brand-700">১.</span> ব্রাউজার মেনু (☰) খুলুন</li>
                <li className="flex gap-2"><span className="font-extrabold text-brand-700">২.</span> “অ্যাপ ইনস্টল করুন” বা “Add to Dock” বেছে নিন</li>
              </ol>
            ) : (
              <ol className="mt-4 space-y-3 text-sm text-slate-700 font-medium">
                <li className="flex gap-2"><span className="font-extrabold text-brand-700">১.</span> অ্যাড্রেস বারের ডান পাশের ইনস্টল আইকন (⊕) এ ক্লিক করুন</li>
                <li className="flex gap-2"><span className="font-extrabold text-brand-700">২.</span> অথবা ব্রাউজার মেনু (⋮) → “মাস্টার্স কম্পিউটার ইনস্টল করুন” বেছে নিন</li>
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  )
}