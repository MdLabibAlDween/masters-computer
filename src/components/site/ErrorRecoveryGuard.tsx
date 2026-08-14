'use client'

import { useEffect } from 'react'

const RECOVERED_FLAG = 'mc-auto-recovered'

export default function ErrorRecoveryGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const alreadyRecovered = () => sessionStorage.getItem(RECOVERED_FLAG) === '1'

    const onUnhandled = (event: PromiseRejectionEvent) => {
      console.error('[UnhandledRejection]', event.reason)
      if (alreadyRecovered()) return
      event.preventDefault()
      sessionStorage.setItem(RECOVERED_FLAG, '1')
      setTimeout(() => window.location.reload(), 800)
    }

    const onWindowError = (event: ErrorEvent) => {
      console.error('[WindowError]', event.error ?? event.message)
      if (alreadyRecovered()) return
      event.preventDefault()
      sessionStorage.setItem(RECOVERED_FLAG, '1')
      setTimeout(() => window.location.reload(), 800)
    }

    window.addEventListener('unhandledrejection', onUnhandled)
    window.addEventListener('error', onWindowError)

    const online = () => {
      if (navigator.onLine) {
        sessionStorage.removeItem(RECOVERED_FLAG)
      }
    }
    window.addEventListener('online', online)

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandled)
      window.removeEventListener('error', onWindowError)
      window.removeEventListener('online', online)
    }
  }, [])

  return null
}
