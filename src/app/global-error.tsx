'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="bn">
      <body style={{ margin: 0, fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: '#f4f1de',
            color: '#3d405b',
          }}
        >
          <div
            style={{
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(224,122,95,0.45)',
              borderRadius: '24px',
              padding: '32px',
            }}
          >
            <div style={{ fontSize: '40px' }}>⚠️</div>
            <h1 style={{ fontSize: '20px', margin: '16px 0 8px' }}>কিছু একটা সমস্যা হয়েছে</h1>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#555' }}>
              সাময়িক সমস্যা হয়েছে। স্বয়ংক্রিয়ভাবে আবার চেষ্টা হচ্ছে…
            </p>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #f2cc8f, #e07a5f)',
                color: '#14151f',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔄 আবার চেষ্টা করুন
            </button>
            {error?.digest && (
              <p style={{ marginTop: '16px', fontSize: '11px', color: '#999' }}>
                রেফারেন্স: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
