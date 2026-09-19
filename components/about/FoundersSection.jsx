"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cinzelFont } from "@/app/fonts";

/**
 * @typedef {Object} FounderItem
 * @property {number | undefined} [sort_order]
 * @property {string} name
 * @property {string} designation
 * @property {string} bio
 * @property {string | null | undefined} [image_path]
 */

function buildImageUrl(path) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? "hod";
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return base ? `${base}/storage/v1/object/public/${bucket}/${path}` : path;
}

/**
 * @param {{ initialItems?: FounderItem[] }} props
 */
export default function FoundersSection({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (initialItems.length) return;
    const load = async () => {
      const response = await fetch("/api/public/about/founders", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) return;
      setItems(payload?.items ?? []);
    };
    load();
  }, [initialItems]);

  const active = items[activeIndex] ?? items[0];
  const goToPrev = () => setActiveIndex((current) => (current - 1 + items.length) % items.length);
  const goToNext = () => setActiveIndex((current) => (current + 1) % items.length);

  return (
    <section style={{ padding: "110px 52px", maxWidth: "1400px", margin: "0 auto" }} className="founders-section">
      <style>{`
        @keyframes founderFade {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 1024px) {
          .founders-section { padding: 70px 28px !important; }
          .founder-slide { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 640px) {
          .founders-section { padding: 60px 20px !important; }
        }
      `}</style>
      <div className="mb-8 text-left sm:mb-10">
        <h2 className="section-title font-[family-name:var(--font-family-primary)] text-[clamp(1.35rem,2.2vw,2rem)] font-medium uppercase leading-none tracking-[0.025em] text-black">
          Meet the Founders
        </h2>
      </div>
      {active ? (
        <div className="relative">
          <div
            key={activeIndex}
            className="founder-slide grid items-center gap-[56px]"
            style={{ gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)", animation: "founderFade .6s ease both" }}
          >
            <div className="relative aspect-square w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #F5F7FC, #EAF0FA)" }}>
              {active.image_path ? (
                <img src={buildImageUrl(active.image_path)} alt={active.name} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center" style={{ fontFamily: "var(--serif)", fontSize: "80px", fontWeight: 400, color: "#0A1628" }}>
                  {(active.name || "FD").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h3 className={`${cinzelFont.variable} font-primary-display`} style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 400, letterSpacing: ".02em", color: "#0A1628", lineHeight: 1.15, marginBottom: "6px" }}>
                {active.name}
              </h3>
              <div style={{ fontSize: "10px", fontWeight: 400, letterSpacing: ".28em", color: "#0A1628", textTransform: "uppercase", marginBottom: "20px" }}>
                {active.designation}
              </div>
              <p style={{ fontSize: "13px", fontWeight: 300, lineHeight: 1.9, color: "#6A6A6A", letterSpacing: ".02em", maxWidth: "560px" }}>
                {active.bio}
              </p>
            </div>
          </div>

          {items.length > 1 ? (
            <div className="mt-10 flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                {items.map((founder, index) => (
                  <button
                    key={`${founder.name}-dot`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show founder ${index + 1}`}
                    className="h-2.5 rounded-full transition-all"
                    style={{ width: index === activeIndex ? "40px" : "10px", background: index === activeIndex ? "#0A1628" : "rgba(10,22,40,0.25)" }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrev}
                  aria-label="Previous founder"
                  className="inline-flex h-11 w-11 items-center justify-center border border-black/20 bg-white text-[#0A1628] transition hover:border-black hover:bg-[#0A1628] hover:text-white"
                >
                  <ChevronLeft size={19} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Next founder"
                  className="inline-flex h-11 w-11 items-center justify-center border border-black/20 bg-white text-[#0A1628] transition hover:border-black hover:bg-[#0A1628] hover:text-white"
                >
                  <ChevronRight size={19} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

