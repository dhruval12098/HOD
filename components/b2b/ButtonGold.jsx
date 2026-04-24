"use client";

export default function ButtonGold({ href, onClick, children }) {
  const cls =
    "inline-flex items-center justify-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#0A1628] bg-[#0A1628] px-[34px] py-4 border-none cursor-pointer uppercase transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(10,22,40,0.22)]";

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

