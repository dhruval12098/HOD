"use client";

export default function B2BProcessCard({ step, eyebrow, title, description }) {
  return (
    <div className="bg-white p-8 border border-[rgba(20,18,13,0.10)] relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-1 hover:border-[rgba(184,146,42,0.25)] hover:shadow-[0_24px_60px_rgba(20,18,13,0.12)] h-full">
      <div className="absolute top-5 right-6 font-numeric text-[46px] font-light text-[#B8922A] opacity-18 leading-[1] select-none pointer-events-none">
        {step}
      </div>

      <div className="text-[10px] font-normal tracking-[0.32em] text-[#B8922A] uppercase mb-3 inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
        {eyebrow}
      </div>

      <div className="font-serif text-[22px] font-normal text-[#14120D] mb-3 tracking-[0.02em] leading-[1.2]">
        {title}
      </div>

      <p className="text-[12px] font-light tracking-[0.08em] text-[#7A7060] leading-[1.9] max-w-[46ch]">
        {description}
      </p>
    </div>
  );
}

