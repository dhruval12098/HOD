import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[var(--theme-base)] px-6 py-24 text-center text-[var(--theme-ink)]">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--theme-muted)]">404</p>
        <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">We couldn&apos;t find that page</h1>
        <p className="mx-auto mt-5 max-w-md leading-7 text-[var(--theme-muted)]">
          The piece you&apos;re looking for may have moved or may no longer be available.
        </p>
        <Link
          href="/shop"
          className="mt-9 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--theme-ink)] px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--theme-ink)]"
        >
          Browse the collection
        </Link>
      </div>
    </main>
  )
}
