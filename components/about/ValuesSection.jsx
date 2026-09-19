"use client";

import { useEffect, useState } from "react";

/**
 * @typedef {Object} ValueItem
 * @property {string | number | undefined} [id]
 * @property {number | undefined} [sort_order]
 * @property {string | null | undefined} [icon_path]
 * @property {string | null | undefined} [image_path]
 * @property {string | null | undefined} [image_alt]
 * @property {string} title
 * @property {string} description
 */
function publicMediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || "hod";
  return base ? `${base}/storage/v1/object/public/${bucket}/${path}` : "";
}

function ValueCard({ item, expanded, onToggle }) {
  const imageUrl = publicMediaUrl(item.image_path);
  const iconUrl = publicMediaUrl(item.icon_path);
  return <button
    type="button"
    aria-expanded={expanded}
    onClick={onToggle}
    className="group relative block aspect-[4/5] w-full overflow-hidden border-0 bg-[#e9e9e9] p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
  >
    {imageUrl ? <img src={imageUrl} alt={item.image_alt || item.title} className="absolute inset-0 size-full object-cover" loading="lazy" /> : <div className="absolute inset-0 flex items-center justify-center bg-[#f1f1f1]">{iconUrl ? <img src={iconUrl} alt="" className="size-16 object-contain opacity-60" /> : null}</div>}
    <div className={`absolute inset-0 transition-colors duration-300 ${expanded ? 'bg-black/68' : 'bg-gradient-to-t from-black/60 via-black/5 to-transparent'}`} />
    <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
      <h3 className="font-[family-name:var(--font-family-primary)] text-lg font-medium leading-tight text-white sm:text-xl">{item.title}</h3>
      <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ${expanded ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden"><p className="font-[family-name:var(--font-family-secondary)] text-xs leading-[1.65] text-white/92 sm:text-sm">{item.description}</p></div>
      </div>
    </div>
  </button>;
}

/** @param {{ initialItems?: ValueItem[] }} props */
export default function ValuesSection({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (initialItems.length) { setLoading(false); return; }
    let active = true;
    fetch("/api/public/about/values", { cache: "no-store" }).then((response) => response.json()).then((payload) => { if (active) setItems(Array.isArray(payload?.items) ? payload.items : []); }).catch(() => { if (active) setItems([]); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [initialItems]);

  if (loading) return <section className="bg-white px-5 py-20 text-center font-[family-name:var(--font-family-secondary)] text-sm text-black/55">Loading values...</section>;
  if (!items.length) return null;

  return <section className="bg-white px-5 py-20 sm:px-7 sm:py-24 lg:px-[52px] lg:py-28" aria-labelledby="about-values-heading">
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-8 text-left sm:mb-10">
        <h2 id="about-values-heading" className="section-title font-[family-name:var(--font-family-primary)] text-[clamp(1.35rem,2.2vw,2rem)] font-medium uppercase leading-none tracking-[0.025em] text-black">Our Values</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const id = String(item.id ?? item.title);
          return <ValueCard key={id} item={item} expanded={expandedId === id} onToggle={() => setExpandedId((current) => current === id ? null : id)} />;
        })}
      </div>
    </div>
  </section>;
}


