"use client";

export default function ButtonOutline({ href, onClick, children }) {
  const cls =
    "inline-flex items-center justify-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#14120D] bg-transparent px-8 py-[15px] border border-[#14120D] cursor-pointer uppercase no-underline transition-all duration-400 hover:bg-[#14120D] hover:text-[#FBF9F5]";

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

