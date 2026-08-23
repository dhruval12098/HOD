'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('Root layout rendering failed:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#fafbfd', color: '#0a1628', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <title>Something went wrong | House of Diams</title>
        <main
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <p style={{ color: '#6a6a6a', fontSize: 12, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              House of Diams
            </p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 6vw, 52px)', margin: '20px 0 0' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#6a6a6a', lineHeight: 1.7, margin: '20px auto 0', maxWidth: 440 }}>
              We couldn&apos;t load the site. Please try again.
            </p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              style={{
                background: '#0a1628',
                border: 0,
                borderRadius: 999,
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                marginTop: 36,
                minHeight: 44,
                padding: '12px 28px',
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
