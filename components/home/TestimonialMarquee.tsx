'use client';

const quotes = [
  { quote: 'Flawless clarity and beautiful customer service', author: 'Priya M · Mumbai' },
  { quote: 'The most stunning ring I have ever owned', author: 'Sarah K · London' },
  { quote: 'Exceptional quality at wholesale pricing', author: 'James O · Manchester' },
  { quote: 'Our go-to supplier for three years running', author: 'Lena B · Amsterdam' },
  { quote: 'Every piece arrives as a work of art', author: 'Ahmed R · Dubai' },
  { quote: 'Bespoke process was seamless from start to finish', author: 'Rachel T · New York' },
  { quote: 'The sparkle on this stone is unreal', author: 'Sophie D · Paris' },
  { quote: 'Worth every penny and then some', author: 'Mohammed A · Riyadh' },
];

export default function TestimonialMarquee() {
  const allQuotes = [...quotes, ...quotes];

  return (
    <div className="py-[50px] bg-[#F6F2EA] border-t border-[rgba(20,18,13,0.10)] border-b overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-[120px] z-[2] pointer-events-none bg-gradient-to-r from-[#F6F2EA] to-transparent" />
      <div className="absolute top-0 bottom-0 right-0 w-[120px] z-[2] pointer-events-none bg-gradient-to-l from-[#F6F2EA] to-transparent" />

      {/* Title */}
      <div className="text-center text-[10px] tracking-[0.32em] uppercase text-[#B8922A] mb-7 font-normal flex items-center justify-center gap-3.5">
        <span className="inline-block w-10 h-px bg-[#B8922A] opacity-50" />
        Loved by Clients Worldwide
        <span className="inline-block w-10 h-px bg-[#B8922A] opacity-50" />
      </div>

      {/* Track */}
      <div className="flex gap-11 animate-marquee-slow w-max items-center">
        {allQuotes.map((item, i) => (
          <div
            key={i}
            className="font-serif text-[18px] font-normal text-[#3A3628] tracking-[0.02em] whitespace-nowrap flex items-center gap-[18px]"
          >
            &ldquo;{item.quote}&rdquo;
            <span className="font-sans text-[10px] not-italic font-medium tracking-[0.24em] uppercase text-[#B8922A] ml-4">
              {item.author}
            </span>
            <span className="inline-block w-[5px] h-[5px] bg-[#B8922A] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
