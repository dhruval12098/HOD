'use client';

import { useState } from 'react';
import type { HomeMarqueeData } from '@/lib/home-data';

type MarqueeItem = {
  quote: string;
  author: string;
};

const defaultQuotes: MarqueeItem[] = [
  { quote: 'Flawless clarity and beautiful customer service', author: 'Priya M · Mumbai' },
  { quote: 'The most stunning ring I have ever owned', author: 'Sarah K · London' },
  { quote: 'Exceptional quality at wholesale pricing', author: 'James O · Manchester' },
  { quote: 'Our go-to supplier for three years running', author: 'Lena B · Amsterdam' },
  { quote: 'Every piece arrives as a work of art', author: 'Ahmed R · Dubai' },
  { quote: 'Bespoke process was seamless from start to finish', author: 'Rachel T · New York' },
  { quote: 'The sparkle on this stone is unreal', author: 'Sophie D · Paris' },
  { quote: 'Worth every penny and then some', author: 'Mohammed A · Riyadh' },
];

export default function TestimonialMarquee({ initialData }: { initialData?: HomeMarqueeData }) {
  const [title] = useState(initialData?.title || 'Loved by Clients Worldwide');
  const [quotes] = useState<MarqueeItem[]>(initialData?.items?.length ? initialData.items : defaultQuotes);

  const allQuotes = [...quotes, ...quotes];

  return (
    <div className="relative overflow-hidden border-b border-t border-[rgba(10,22,40,0.10)] bg-[#FAF7F2] py-[50px]">
      <div className="absolute top-0 bottom-0 left-0 z-[2] w-[120px] pointer-events-none bg-gradient-to-r from-[#FAF7F2] to-transparent" />
      <div className="absolute top-0 bottom-0 right-0 z-[2] w-[120px] pointer-events-none bg-gradient-to-l from-[#FAF7F2] to-transparent" />

      <div className="mb-7 flex items-center justify-center gap-3.5 text-center text-[10px] font-normal uppercase tracking-[0.32em] text-[#0A1628]">
        <span className="inline-block h-px w-10 bg-[#0A1628] opacity-50" />
        {title}
        <span className="inline-block h-px w-10 bg-[#0A1628] opacity-50" />
      </div>

      <div className="flex w-max items-center gap-11 animate-marquee-slow">
        {allQuotes.map((item, i) => (
          <div
            key={`${item.quote}-${item.author}-${i}`}
            className="flex items-center gap-[18px] whitespace-nowrap font-serif text-[18px] font-normal tracking-[0.02em] text-[#253246]"
          >
            &ldquo;{item.quote}&rdquo;
            <span className="ml-4 font-sans text-[10px] font-medium not-italic uppercase tracking-[0.24em] text-[#0A1628]">
              {item.author}
            </span>
            <span className="inline-block h-[5px] w-[5px] rounded-full bg-[#0A1628]" />
          </div>
        ))}
      </div>
    </div>
  );
}
