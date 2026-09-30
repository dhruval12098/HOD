"use client";

import Link from "next/link";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] tracking-[0.3em] uppercase text-gray-700">
        {items.map((it, idx) => {
          const last = idx === items.length - 1;
          return (
            <li key={`${it.href || it.label}-${idx}`} className="flex items-center">
              {idx > 0 && <span className="mx-2 text-gray-700">/</span>}
              {it.href && !last ? (
                <Link
                  href={it.href}
                  className="text-gray-700 no-underline transition-colors duration-300 hover:text-gray-900"
                >
                  {it.label}
                </Link>
              ) : (
                <span className="text-gray-700">{it.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
