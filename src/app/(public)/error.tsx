'use client'

import ErrorFallback from '@/components/site/ErrorFallback'

export default function PublicError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorFallback error={error} retry={retry} />
}
