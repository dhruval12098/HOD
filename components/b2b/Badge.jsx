"use client";

export default function Badge({ children }) {
  return (
    <div className="inline-flex items-center gap-2.5 px-[18px] py-[7px] text-[10px] font-normal tracking-[0.3em] text-[#0A1628] bg-[#F5F7FC] border border-[rgba(10,22,40,0.25)] uppercase before:content-[''] before:w-[5px] before:h-[5px] before:bg-[#0A1628] before:rounded-full">
      {children}
    </div>
  );
}

