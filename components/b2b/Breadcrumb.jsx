"use client";

import Link from "next/link";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] tracking-[0.3em] uppercase text-[#6A6A6A]">
        {items.map((it, idx) => {
          const last = idx === items.length - 1;
          return (
            <li key={`${it.href || it.label}-${idx}`} className="flex items-center">
              {idx > 0 && <span className="mx-2 text-[#7F8898]">/</span>}
              {it.href && !last ? (
                <Link
                  href={it.href}
                  className="text-[#6A6A6A] no-underline hover:text-[#0A1628] transition-colors duration-300"
                >
                  {it.label}
                </Link>
              ) : (
                <span className={last ? "text-[#0A1628]" : ""}>{it.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

