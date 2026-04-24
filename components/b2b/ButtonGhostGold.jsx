"use client";

export default function ButtonGhostGold({ href, onClick, children }) {
  const cls =
    "inline-flex items-center justify-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#FFFFFF] bg-transparent px-8 py-[15px] border border-[rgba(232,216,152,0.35)] cursor-pointer uppercase no-underline transition-all duration-400 hover:bg-[#FFFFFF] hover:text-[#0A1628] hover:border-[#FFFFFF]";

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

