"use client";

export default function ButtonPrimary({ href, onClick, children }) {
  const cls =
    "inline-flex items-center justify-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#FAFBFD] bg-[#0A1628] px-[34px] py-4 border-none cursor-pointer uppercase relative overflow-hidden group transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(10,22,40,0.18)]";

  const Inner = (
    <>
      <span className="absolute inset-0 bg-[#0A1628] z-0 translate-y-full group-hover:translate-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.77,0,0.18,1)]" />
      <span className="relative z-10">{children}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={cls}>
        {Inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {Inner}
    </button>
  );
}

