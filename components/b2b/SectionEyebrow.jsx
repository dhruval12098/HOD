"use client";

export default function SectionEyebrow({ children, center = true }) {
  return (
    <div className={center ? "flex justify-center" : ""}>
      <div className="text-[10px] font-normal tracking-[0.32em] text-[#B8922A] uppercase inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
        {children}
      </div>
    </div>
  );
}

