'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { HomeMaterialItem } from '@/lib/home-data'

type MaterialItem = {
  sort_order: number
  title: string
  description: string
  icon_path: string
}

function buildIconUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod'
  return base ? `${base}/storage/v1/object/public/${bucket}/${path}` : ''
}

function fallbackIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <polygon points="18,4 30,12 26,32 10,32 6,12" stroke="#0A1628" strokeWidth="1" fill="rgba(10,22,40,0.06)" />
    </svg>
  )
}

const defaultMaterials: MaterialItem[] = [
  { sort_order: 1, title: 'Natural Diamonds', description: 'Ethically sourced · All cuts · D-Z colour · FL-SI', icon_path: '' },
  { sort_order: 2, title: 'Precious Gems', description: 'Emeralds · Rubies · Sapphires · Alexandrite', icon_path: '' },
  { sort_order: 3, title: 'Precious Metals', description: 'Platinum · 22K · 18K · 14K · 10K · 925 Silver', icon_path: '' },
  { sort_order: 4, title: 'CVD Diamonds', description: 'Type IIA lab-grown · All cuts · Conflict-free', icon_path: '' },
]

export default function MaterialStrip({ items = [] }: { items?: HomeMaterialItem[] }) {
  const [materials] = useState<MaterialItem[]>(items.length ? items : defaultMaterials)

  return (
    <section className="py-[110px] px-[52px] max-w-[1400px] mx-auto grid grid-cols-[1fr_1.4fr] gap-20 items-center max-lg:grid-cols-1 max-lg:gap-10 max-lg:px-7 max-md:px-5 max-md:py-[70px]">
      <div>
        <div className="w-[60px] h-px bg-[#0A1628] mb-6" />
        <div className="text-[10px] font-normal tracking-[0.32em] text-[#0A1628] uppercase mb-3.5 inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#0A1628]">
          Precious Materials
        </div>
        <h2 className="font-serif font-light tracking-[0.02em] text-[#0A1628] leading-[1.05] mb-[22px] text-[clamp(40px,5.5vw,72px)]">
          More Than <em className="not-italic text-[#0A1628] font-normal">Diamonds</em>
        </h2>
        <p className="text-[13px] font-light leading-[2] text-[#6A6A6A] tracking-[0.04em] mb-8">
          We work with the world&apos;s most precious materials - from CVD diamonds to natural gemstones,
          platinum to 22K gold. Every material selected for its rarity, beauty and integrity.
        </p>
        <Link
          href="/bespoke"
          className="inline-flex items-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#0A1628] bg-transparent px-8 py-[15px] border border-[#0A1628] cursor-pointer uppercase no-underline transition-all duration-400 hover:bg-[#0A1628] hover:text-[#FAFBFD]"
        >
          Explore Custom Orders
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {materials.map((mat) => (
          <div
            key={mat.sort_order}
            className="bg-white p-8 border border-[rgba(10,22,40,0.10)] transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-1 hover:border-[rgba(10,22,40,0.25)] hover:shadow-[0_8px_30px_rgba(10,22,40,0.08)]"
          >
            <div className="mb-5">
              {mat.icon_path ? (
                <img
                  src={buildIconUrl(mat.icon_path)}
                  alt={mat.title}
                  className="h-9 w-9 object-cover"
                  loading="lazy"
                />
              ) : (
                fallbackIcon()
              )}
            </div>
            <div className="font-serif text-[20px] font-normal text-[#0A1628] mb-2.5 tracking-[0.02em]">
              {mat.title}
            </div>
            <p className="text-[10px] font-light tracking-[0.1em] text-[#6A6A6A] leading-[1.8]">
              {mat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
