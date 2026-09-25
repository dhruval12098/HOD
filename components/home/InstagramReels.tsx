'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { HomeInstagramReelsData } from '@/lib/home-data'

function toEmbedUrl(url: string) {
  const normalized = url.endsWith('/') ? url : `${url}/`
  return `${normalized}embed/`
}

function ReelCard({ item }: { item: HomeInstagramReelsData['items'][number] }) {
  const title = item.title || 'House of Diams reel'

  return (
    <article className="group relative h-[400px] w-[255px] shrink-0 overflow-hidden bg-black sm:h-[440px] sm:w-[280px]">
      <iframe
        title={`Instagram: ${title}`}
        src={toEmbedUrl(item.instagramUrl)}
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture"
        scrolling="no"
        className="instagram-reel-frame absolute left-1/2 top-0 border-0 bg-black"
      />
    </article>
  )
}

export default function InstagramReels({ data }: { data: HomeInstagramReelsData }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [canGoPrevious, setCanGoPrevious] = useState(false)
  const [canGoNext, setCanGoNext] = useState(false)

  const updateControls = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
    setHasOverflow(maxScrollLeft > 1)
    setCanGoPrevious(scroller.scrollLeft > 1)
    setCanGoNext(scroller.scrollLeft < maxScrollLeft - 1)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    updateControls()
    const resizeObserver = new ResizeObserver(updateControls)
    resizeObserver.observe(scroller)
    window.addEventListener('resize', updateControls)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateControls)
    }
  }, [data.items.length, updateControls])

  const scrollReels = (direction: -1 | 1) => {
    const scroller = scrollerRef.current
    if (!scroller) return

    scroller.scrollBy({
      left: direction * Math.max(240, Math.floor(scroller.clientWidth * 0.8)),
      behavior: 'smooth',
    })
  }

  if (!data.isEnabled || data.items.length === 0) return null

  return (
    <section aria-labelledby="instagram-reels-heading" className="overflow-hidden bg-white px-[var(--space-2)] py-[var(--space-4)] text-[#111b2b] sm:px-[var(--space-3)] lg:px-[var(--space-4)] lg:py-[var(--space-4)]">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 id="instagram-reels-heading" className="section-title font-primary-display font-light leading-[1.08] tracking-[0.01em] text-[#0A1628] max-md:text-[28px]" style={{ fontSize: 'clamp(24px, 4.5vw, 54px)', fontWeight: 400 }}>
          {data.heading || 'Instagram'}
        </h2>
        {hasOverflow ? (
          <div className="flex shrink-0 items-center gap-2" aria-label="Instagram reel navigation">
            <button type="button" onClick={() => scrollReels(-1)} disabled={!canGoPrevious} aria-label="Show previous Instagram reels" className="grid size-9 place-items-center border border-black/20 bg-white text-black transition hover:border-black disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
              <ChevronLeft size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => scrollReels(1)} disabled={!canGoNext} aria-label="Show next Instagram reels" className="grid size-9 place-items-center border border-black/20 bg-white text-black transition hover:border-black disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
              <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      <div ref={scrollerRef} onScroll={updateControls} className="-mx-[var(--space-2)] flex gap-4 overflow-x-auto scroll-smooth px-[var(--space-2)] py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-[var(--space-3)] sm:gap-5 sm:px-[var(--space-3)] lg:-mx-[var(--space-4)] lg:px-[var(--space-4)]">
        {data.items.map((item) => <ReelCard key={item.id} item={item} />)}
      </div>

      <style>{`.instagram-reel-frame { width: calc(100% + 96px); height: calc(100% + 180px); transform: translate(-50%, -104px); overflow: hidden; } .instagram-reel-frame::-webkit-scrollbar { display: none; }`}</style>
    </section>
  )
}
