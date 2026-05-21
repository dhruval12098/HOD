'use client';

import type { HomeTrustedPartnersData } from '@/lib/home-data';

const fallbackPartners = [
  { name: 'FMOD', src: '/trusted-partners/fmod.svg' },
  { name: 'Foodpanda', src: '/trusted-partners/foodpanda.svg' },
  { name: 'Partner mark 1', src: '/trusted-partners/group-3.webp' },
  { name: 'Partner mark 2', src: '/trusted-partners/group-5.webp' },
  { name: 'Partner mark 3', src: '/trusted-partners/group-6.webp' },
  { name: 'Hitachi', src: '/trusted-partners/hitachi.svg' },
  { name: 'iFood', src: '/trusted-partners/ifood.svg' },
];

export default function TrustedPartnersMarquee({ data }: { data?: HomeTrustedPartnersData }) {
  const partners = data?.logos?.length
    ? data.logos.map((logo) => ({
        name: logo.name,
        src: logo.logoUrl,
        alt: logo.logoAlt || `${logo.name} logo`,
        href: logo.linkUrl || '',
      }))
    : fallbackPartners.map((partner) => ({ ...partner, alt: `${partner.name} logo`, href: '' }));

  if (data && (!data.isEnabled || partners.length === 0)) return null;

  const loop = [...partners, ...partners, ...partners];
  const heading = data?.heading || 'Trusted Partners';

  return (
    <section className="relative overflow-hidden border-y border-[rgba(10,22,40,0.08)] bg-white py-14 sm:py-16">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[90px] bg-gradient-to-r from-white to-transparent sm:w-[150px]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[90px] bg-gradient-to-l from-white to-transparent sm:w-[150px]" />

      <h2
        className="mb-9 text-center font-display-title font-light uppercase leading-[1.08] tracking-[0.01em] text-[#0A1628] max-md:text-[28px]"
        style={{ fontSize: 'clamp(24px, 4.5vw, 54px)', fontWeight: 400 }}
      >
        {heading}
      </h2>

      <div className="flex w-max items-center gap-14 animate-marquee-slow sm:gap-20">
        {loop.map((partner, index) => (
          <a
            key={`${partner.name}-${index}`}
            href={partner.href || undefined}
            aria-label={partner.href ? `Open ${partner.name}` : undefined}
            className="flex h-14 min-w-[130px] items-center justify-center opacity-70 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0 sm:h-16 sm:min-w-[160px]"
          >
            <img
              src={partner.src}
              alt={partner.alt}
              className="max-h-10 max-w-[150px] object-contain sm:max-h-12 sm:max-w-[180px]"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
