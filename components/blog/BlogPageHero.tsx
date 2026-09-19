import Image from 'next/image'
import Link from 'next/link'
import type { BlogPageHero as BlogPageHeroData } from '@/lib/blog'

export function BlogPageHero({ hero }: { hero: BlogPageHeroData }) {
  const hasImage = Boolean(hero.desktopImageUrl || hero.mobileImageUrl)

  return (
    <section className="relative min-h-[360px] overflow-hidden bg-[#171717] sm:min-h-[390px] lg:aspect-[3.4/1] lg:min-h-0" aria-labelledby="blog-hero-heading">
      {hasImage ? (
        <picture>
          {hero.mobileImageUrl ? <source media="(max-width: 639px)" srcSet={hero.mobileImageUrl} /> : null}
          <Image src={hero.desktopImageUrl || hero.mobileImageUrl} alt={hero.desktopImageAlt || hero.mobileImageAlt} fill priority sizes="(max-width: 1536px) 94vw, 1400px" className="object-cover" />
        </picture>
      ) : null}
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative z-10 flex min-h-[360px] max-w-[600px] flex-col justify-center px-6 py-12 text-white sm:min-h-[390px] sm:px-10 lg:min-h-full lg:px-14">
        <h1 id="blog-hero-heading" className="font-primary-display text-[clamp(30px,4vw,52px)] font-medium leading-[1.05] text-white">{hero.heading}</h1>
        {hero.paragraph ? <p className="mt-4 max-w-[520px] font-secondary text-[13px] leading-6 text-white/90 sm:text-[14px]">{hero.paragraph}</p> : null}
        {hero.buttonLabel && hero.buttonLink ? (
          <Link href={hero.buttonLink} className="brand-button mt-6 w-fit border border-white bg-white px-5 text-[#111] hover:bg-transparent hover:text-white">{hero.buttonLabel}</Link>
        ) : null}
      </div>
    </section>
  )
}
