'use client'

import { useEffect } from 'react'

export default function ErrorFallback({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('Route rendering failed:', error)
  }, [error])

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[var(--theme-base)] px-6 py-24 text-center text-[var(--theme-ink)]">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--theme-muted)]">House of Diams</p>
        <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">Something went wrong</h1>
        <p className="mx-auto mt-5 max-w-md leading-7 text-[var(--theme-muted)]">
          We couldn&apos;t load this page. Please try again.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-9 min-h-11 rounded-full bg-[var(--theme-ink)] px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--theme-ink)]"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
