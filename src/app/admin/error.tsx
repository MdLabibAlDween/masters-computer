'use client'

import ErrorFallback from '@/components/site/ErrorFallback'

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <ErrorFallback
      error={error}
      retry={retry}
      title="অ্যাডমিন প্যানেলে সমস্যা হয়েছে"
      message="আবার চেষ্টা করুন। সমস্যাটি অব্যাহত থাকলে লগআউট করে নতুন করে লগইন করুন।"
      autoRetries={2}
    />
  )
}
