'use client'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { HomeInstagramReelsData } from '@/lib/home-data'

function toEmbedUrl(url: string) {
  const normalized = url.endsWith('/') ? url : `${url}/`
  return `${normalized}embed/`
}

function ReelCard({ item, duplicate = false }: { item: HomeInstagramReelsData['items'][number]; duplicate?: boolean }) {
  const [active, setActive] = useState(false)
  const embedUrl = toEmbedUrl(item.instagramUrl)
  const title = item.title || 'House of Diams reel'

  return (
    <article
      className="group relative h-[400px] w-[255px] shrink-0 overflow-hidden bg-black sm:h-[440px] sm:w-[280px]"
      aria-hidden={duplicate || undefined}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <button
        type="button"
        tabIndex={duplicate ? -1 : 0}
        onClick={() => setActive(true)}
        className={`absolute inset-0 z-10 h-full w-full overflow-hidden bg-black transition-opacity duration-300 focus-visible:outline-2 focus-visible:outline-offset-[-5px] focus-visible:outline-[#9b7548] ${active ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        aria-label={`Play ${title}`}
      >
        {item.coverImageUrl ? (
          <img
            src={item.coverImageUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            aria-hidden="true"
          />
        ) : (
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(193,140,104,.26),transparent_35%),linear-gradient(150deg,#f8f3e9,#e5d9c9)]" aria-hidden="true" />
        )}
        <span className="absolute inset-0 bg-black/10" aria-hidden="true" />
        <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#111b2b]" aria-hidden="true">
          <span className="ml-1 h-0 w-0 border-y-[13px] border-l-[20px] border-y-transparent border-l-current" />
        </span>
      </button>

      {active ? (
        <iframe
          title={`Instagram: ${title}`}
          src={embedUrl}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture"
          scrolling="no"
          tabIndex={duplicate ? -1 : 0}
          className="instagram-reel-frame absolute left-1/2 top-0 border-0 bg-black"
        />
      ) : null}
    </article>
  )
}

export default function InstagramReels({ data }: { data: HomeInstagramReelsData }) {
  if (!data.isEnabled || data.items.length === 0) return null

  const animated = data.items.length > 1
  const items = animated ? [...data.items, ...data.items] : data.items

  return (
    <section aria-labelledby="instagram-reels-heading" className="overflow-hidden bg-white px-[var(--space-2)] py-[var(--space-4)] text-[#111b2b] sm:px-[var(--space-3)] lg:px-[var(--space-4)] lg:py-[var(--space-4)]">
      <h2
        id="instagram-reels-heading"
        className="section-title mb-[var(--space-6)] font-primary-display font-light leading-[1.08] tracking-[0.01em] text-[#0A1628] max-md:text-[28px]"
        style={{ fontSize: 'clamp(24px, 4.5vw, 54px)', fontWeight: 400 }}
      >
        {data.heading || 'Instagram'}
      </h2>

      <div className="instagram-reels-mask -mx-[var(--space-2)] overflow-hidden py-2 sm:-mx-[var(--space-3)] lg:-mx-[var(--space-4)]" data-pause={data.pauseOnHover}>
        <div
          className={animated ? 'instagram-reels-track flex w-max gap-4 px-[var(--space-2)] sm:gap-5 sm:px-[var(--space-3)] lg:px-[var(--space-4)]' : 'flex justify-start px-[var(--space-2)] sm:px-[var(--space-3)] lg:px-[var(--space-4)]'}
          style={animated ? { '--reels-duration': `${data.marqueeDurationSeconds}s` } as CSSProperties : undefined}
        >
          {items.map((item, index) => (
            <ReelCard key={`${item.id}-${index}`} item={item} duplicate={animated && index >= data.items.length} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes instagramReelsMarquee { from { transform: translateX(100vw); } to { transform: translateX(-50%); } }
        .instagram-reels-track { animation: instagramReelsMarquee var(--reels-duration) linear infinite; }
        .instagram-reels-mask[data-pause="true"]:hover .instagram-reels-track,
        .instagram-reels-mask[data-pause="true"]:focus-within .instagram-reels-track { animation-play-state: paused; }
        .instagram-reel-frame {
          width: calc(100% + 96px);
          height: calc(100% + 180px);
          transform: translate(-50%, -104px);
          overflow: hidden;
        }
        .instagram-reel-frame::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) { .instagram-reels-track { animation: none; overflow-x: auto; max-width: 100%; } }
      `}</style>
    </section>
  )
}