"use client";

export default function Badge({ children }) {
  return (
    <div className="inline-flex items-center gap-2.5 px-[18px] py-[7px] text-[10px] font-normal tracking-[0.3em] text-[#B8922A] bg-[#F5EDD6] border border-[rgba(184,146,42,0.25)] uppercase before:content-[''] before:w-[5px] before:h-[5px] before:bg-[#B8922A] before:rounded-full">
      {children}
    </div>
  );
}

