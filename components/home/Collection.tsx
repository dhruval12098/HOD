'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { HomeCollectionItem } from '@/lib/home-data';

interface CollectionProps {
  onEnquire?: (name: string) => void;
  items?: HomeCollectionItem[];
}

interface PanelData {
  index: number;
  name: string;
  label: string;
  desc: string;
  cta: string;
  ctaHref: string;
  imageSrc?: string | null;
  bgClass: string;
}

interface CollectionApiItem {
  sort_order: number;
  label: string;
  title: string;
  description: string;
  image_path: string;
  link: string;
}

const PANELS: PanelData[] = [
  {
    index: 0,
    name: 'Fine Jewellery',
    label: 'Collection 01',
    desc: 'Necklaces, earrings, bracelets & pendants',
    cta: 'Shop Now',
    ctaHref: '/fine-jewellery',
    bgClass: 'bg-[linear-gradient(145deg,#f8f6f0,#ddd5be)]',
  },
  {
    index: 1,
    name: 'Engagement Rings',
    label: 'Collection 02',
    desc: 'Solitaire, halo, pave & three stone',
    cta: 'Shop Now',
    ctaHref: '/engagement-rings',
    bgClass: 'bg-[linear-gradient(145deg,#f0ece4,#d8cebb)]',
  },
  {
    index: 2,
    name: 'Wedding Bands',
    label: 'Collection 03',
    desc: 'For her & for him, classic to diamond-set',
    cta: 'Shop Now',
    ctaHref: '/wedding-bands',
    bgClass: 'bg-[linear-gradient(145deg,#faf8f4,#e8e0d0)]',
  },
  {
    index: 3,
    name: 'Hip Hop',
    label: 'Collection 04',
    desc: 'Iced chains, grillz & statement pieces',
    cta: 'Shop Now',
    ctaHref: '/hiphop',
    bgClass: 'bg-[linear-gradient(145deg,#f3eee5,#d9cfbf)]',
  },
];

const COLLECTION_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod';
const COLLECTION_BUCKET_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${COLLECTION_BUCKET}`
  : '';

function mapPanels(items: CollectionApiItem[]): PanelData[] {
  return items.slice(0, 4).map((item, index) => ({
    index,
    name: item.title,
    label: item.label || `Collection ${String(index + 1).padStart(2, '0')}`,
    desc: item.description,
    cta: 'Shop Now',
    ctaHref: item.link,
    imageSrc: item.image_path ? `${COLLECTION_BUCKET_URL}/${item.image_path}` : null,
    bgClass: index % 2 === 0 ? 'bg-[linear-gradient(145deg,#f8f6f0,#ddd5be)]' : 'bg-[linear-gradient(145deg,#f0ece4,#d8cebb)]',
  }));
}

export default function Collection({ items = [] }: CollectionProps) {
  const router = useRouter();
  const panels = items.length ? mapPanels(items) : PANELS;

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mb-10 text-center sm:mb-14">
        <div className="inline-flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.32em] text-[#0A1628]">
          <span className="inline-block h-px w-6 bg-[#0A1628]" />
          Explore
          <span className="inline-block h-px w-6 bg-[#0A1628]" />
        </div>
        <h2 className="mt-4 font-serif text-[clamp(26px,5vw,60px)] font-light leading-[1.02] text-[#0A1628] max-md:text-[32px]">
          Our <em className="not-italic italic">Collections</em>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[12px] font-light tracking-[0.1em] text-[#6A6A6A] sm:text-[13px]">
          Discover the signature worlds of House of Diams through a refined card-based selection.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {panels.map((panel, index) => (
          <article
            key={`${panel.name}-${index}`}
            className="group overflow-hidden rounded-[24px] border border-white/30 bg-white shadow-[0_18px_48px_rgba(10,22,40,0.08)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(10,22,40,0.14)]"
          >
            <button
              type="button"
              onClick={() => router.push(panel.ctaHref)}
              className="block w-full text-left"
            >
              <div className={`relative aspect-[0.9] overflow-hidden ${panel.bgClass}`}>
                {panel.imageSrc ? (
                  <img
                    src={panel.imageSrc}
                    alt={panel.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    loading={index < 2 ? 'eager' : 'lazy'}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#fff7e4_0%,#efe6d5_42%,#dfd3bf_100%)]" />
                )}

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,22,40,0.06)_0%,rgba(10,22,40,0.18)_48%,rgba(10,22,40,0.76)_100%)]" />

                <div className="absolute inset-x-0 bottom-0 z-[1] p-4 sm:p-5">
                  <div className="text-[7px] font-medium uppercase tracking-[0.22em] text-white/70 sm:text-[8px]">
                    {panel.label}
                  </div>
                  <h3 className="mt-1.5 font-sans text-[24px] font-bold leading-[1.01] text-white sm:text-[30px]">
                    {panel.name}
                  </h3>
                  <div className="mt-1.5 inline-flex items-center gap-2.5 text-[8px] font-medium uppercase tracking-[0.2em] text-white/92 sm:text-[9px]">
                    <span>{panel.cta}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M4 3L9 7L4 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
