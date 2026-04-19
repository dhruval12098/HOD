'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { PRODUCTS } from '@/lib/data/products';
import ProductCard from '../shop/ProductCard';

// ── Collection ────────────────────────────────────────────────────────────────
interface CollectionProps {
  onEnquire?: (name: string) => void;
}

export default function Collection({ onEnquire }: CollectionProps) {
  const [cat, setCat] = useState<'fine' | 'hiphop'>('fine');
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('hod_wishlist') || '[]');
      setWishlist(saved);
    } catch {}
  }, []);

  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem('hod_wishlist', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const products = PRODUCTS.filter(p => p.category === cat && p.featured).slice(0, 6);

  return (
    <section className="py-[110px] px-[52px] max-w-[1400px] mx-auto relative max-lg:px-7 max-md:px-5 max-md:py-[70px]">
      {/* Header */}
      <div className="flex justify-between items-end mb-14 flex-wrap gap-6">
        <div>
          <div className="text-[10px] font-normal tracking-[0.32em] text-[#B8922A] uppercase mb-[18px] inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
            Featured Pieces
          </div>
          <h2 className="font-serif font-light tracking-[0.02em] text-[#14120D] leading-[1.05] text-[clamp(40px,5.5vw,72px)]">
            The <em className="not-italic text-[#B8922A] font-normal">Collection</em>
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-[10px] font-normal tracking-[0.28em] text-[#14120D] uppercase no-underline inline-flex items-center gap-2.5 pb-1 border-b border-[#14120D] transition-[color,border-color,gap] duration-300 hover:text-[#B8922A] hover:border-[#B8922A] hover:gap-4"
        >
          View All →
        </Link>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mb-9">
        <div className="flex border border-[rgba(20,18,13,0.10)] p-1 max-w-[500px] w-full bg-white max-md:max-w-full">
          {(['fine', 'hiphop'] as const).map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`flex-1 py-3.5 px-5 text-[10px] font-normal tracking-[0.26em] uppercase transition-all duration-400 cursor-pointer border-none max-md:text-[9px] max-md:tracking-[0.18em] max-md:py-3 max-md:px-2 ${
                cat === c ? 'bg-[#14120D] text-[#FBF9F5]' : 'bg-transparent text-[#7A7060] hover:text-[#14120D]'
              }`}
            >
              {c === 'fine' ? 'Fine Jewellery' : 'Hip Hop Jewellery'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-7 max-md:grid-cols-1">
        {products.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            wishlisted={wishlist.includes(p.id)}
            onWishlist={toggleWishlist}
            onEnquire={(name: string) => onEnquire?.(name)}
          />
        ))}
      </div>
    </section>
  );
}
