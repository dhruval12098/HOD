"use client";

export default function B2BBenefitCard({ icon, title, description }) {
  return (
    <div className="bg-white p-8 border border-[rgba(20,18,13,0.10)] transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-1 hover:border-[rgba(184,146,42,0.25)] hover:shadow-[0_24px_60px_rgba(20,18,13,0.12)] h-full">
      <div className="mb-5">{icon}</div>
      <div className="font-serif text-[20px] font-normal text-[#14120D] mb-2.5 tracking-[0.02em]">
        {title}
      </div>
      <p className="text-[11px] font-light tracking-[0.08em] text-[#7A7060] leading-[1.9]">
        {description}
      </p>
    </div>
  );
}

