'use client'

import { useEffect, useRef, useState } from 'react'
import type { HomeCertificationItem, HomeCertificationSection } from '@/lib/home-data'

type CertificationSection = {
  eyebrow: string
  heading: string
}

type CertificationItem = {
  sort_order: number
  title: string
  description: string
  badge: string
  icon_path: string
}

function RevealDiv({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          entries[0].target.classList.add('opacity-100', 'translate-y-0')
          entries[0].target.classList.remove('opacity-0', 'translate-y-6')
          obs.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px' }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-6 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function buildIconUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod'
  return base ? `${base}/storage/v1/object/public/${bucket}/${path}` : ''
}

export default function Certifications({
  initialSection,
  initialItems = [],
}: {
  initialSection?: HomeCertificationSection
  initialItems?: HomeCertificationItem[]
}) {
  const [section] = useState<CertificationSection>(initialSection ?? {
    eyebrow: 'Our Promise',
    heading: 'Why Choose House of Diams',
  })
  const [certs] = useState<CertificationItem[]>(initialItems)

  const [firstWord, ...rest] = section.heading.split(' ')

  return (
    <section className="py-[110px] px-[52px] max-w-[1400px] mx-auto max-lg:px-7 max-md:px-5 max-md:py-[70px]">
      <RevealDiv className="flex flex-col items-center text-center mb-16">
        <p className="text-[8px] font-normal tracking-[0.28em] uppercase text-[#0A1628] opacity-60 mb-[14px]">
          {section.eyebrow}
        </p>

        <h2
          className="font-serif font-light tracking-[0.01em] text-[#0A0A0A] leading-[1.08]"
          style={{ fontSize: 'clamp(34px, 4.5vw, 54px)' }}
        >
          {firstWord}{' '}
          <em className="not-italic italic font-normal text-[#0A1628]">
            {rest.join(' ')}
          </em>
        </h2>
      </RevealDiv>

      <RevealDiv delay={150}>
        <div className="grid grid-cols-5 max-lg:grid-cols-3 max-sm:grid-cols-2">
          {certs.map((cert, i) => (
            <div
              key={cert.sort_order}
              className={[
                'group relative flex flex-col items-center text-center px-7 py-11',
                'transition-colors duration-300 hover:bg-white/70',
                'border-r border-[rgba(10,22,40,0.09)]',
                i === certs.length - 1 ? '!border-r-0' : '',
                i === 2 ? 'max-lg:!border-r-0' : '',
                i % 2 === 1 ? 'max-sm:!border-r-0' : '',
              ].join(' ')}
            >
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-[#0A1628] transition-[width] duration-[400ms] ease-[cubic-bezier(.4,0,.2,1)] group-hover:w-4/5" />

              <div className="w-9 h-9 flex items-center justify-center mb-5 flex-shrink-0">
                {cert.icon_path ? (
                  <img
                    src={buildIconUrl(cert.icon_path)}
                    alt={cert.title}
                    className="w-9 h-9 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                    <polygon points="20,3 35,13 30,35 10,35 5,13" stroke="#0A1628" strokeWidth="1.8" fill="none" />
                    <polygon points="20,9 29,16 26,31 14,31 11,16" fill="#0A1628" opacity=".12" />
                    <line x1="5" y1="13" x2="35" y2="13" stroke="#0A1628" strokeWidth="1.2" opacity=".25" />
                    <line x1="20" y1="3" x2="5" y2="13" stroke="#0A1628" strokeWidth="1.2" opacity=".3" />
                    <line x1="20" y1="3" x2="35" y2="13" stroke="#0A1628" strokeWidth="1.2" opacity=".3" />
                  </svg>
                )}
              </div>

              <div className="font-serif text-[17px] font-normal tracking-[0.02em] text-[#0A0A0A] leading-[1.25]">
                {cert.title}
              </div>

              {cert.description && (
                <p className="text-[10px] font-light leading-[1.8] text-[#6A6A6A] tracking-[0.02em] mt-2 mb-[14px] flex-1">
                  {cert.description}
                </p>
              )}

              {cert.badge && (
                <div className="mt-auto inline-block px-3 py-[5px] text-[7.5px] font-medium tracking-[0.26em] uppercase text-[#0A1628] bg-[rgba(10,22,40,0.05)] border border-[rgba(10,22,40,0.12)]">
                  {cert.badge}
                </div>
              )}
            </div>
          ))}
        </div>
      </RevealDiv>
    </section>
  )
}
