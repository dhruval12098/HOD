"use client";

export default function ButtonOutline({ href, onClick, children }) {
  const cls =
    "inline-flex items-center justify-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#0A1628] bg-transparent px-8 py-[15px] border border-[#0A1628] cursor-pointer uppercase no-underline transition-all duration-400 hover:bg-[#0A1628] hover:text-[#FAFBFD]";

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

