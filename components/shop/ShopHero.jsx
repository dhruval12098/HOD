'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * @typedef {{ id: string; title: string; iconUrl?: string | null; options: { label: string; href: string; type?: 'default' | 'swatch' | 'icon', iconUrl?: string | null }[], emphasis?: 'section' | 'group' }} ShopHeroBrowseSection
 */

/**
 * @param {{
 *   title?: string
 *   subtitle?: string
 *   browseSections?: ShopHeroBrowseSection[]
 * }} props
 */
export default function ShopHero({
  title = 'Our Collection',
  subtitle = 'Browse our curated selection of fine jewellery with natural and CVD diamonds. Every piece certified, every stone responsibly sourced.',
  browseSections = [],
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const matchedSectionId = useMemo(() => {
    const currentParams = searchParams?.toString() ?? '';

    for (const section of browseSections) {
      for (const option of section.options ?? []) {
        try {
          const target = new URL(option.href, 'https://houseofdiams.local');
          const targetPath = target.pathname;
          const targetParams = target.searchParams.toString();

          if (targetPath === pathname && targetParams === currentParams) {
            return section.id;
          }
        } catch {
          continue;
        }
      }
    }

    return '';
  }, [browseSections, pathname, searchParams]);

  const [activeSectionId, setActiveSectionId] = useState(matchedSectionId || (browseSections[0]?.id ?? ''));

  const tabsWrapWidth = useMemo(() => {
    if (browseSections.length <= 1) return 'fit-content';
    if (browseSections.length === 2) return '420px';
    if (browseSections.length === 3) return '620px';
    return '760px';
  }, [browseSections.length]);

  useEffect(() => {
    setActiveSectionId((current) => {
      if (matchedSectionId && browseSections.some((section) => section.id === matchedSectionId)) {
        return matchedSectionId;
      }
      if (browseSections.some((section) => section.id === current)) return current;
      return browseSections[0]?.id ?? '';
    });
  }, [browseSections, matchedSectionId]);

  const activeSection = browseSections.find((section) => section.id === activeSectionId) ?? browseSections[0] ?? null;

  return (
    <section
      className="shop-hero-section"
      style={{
        padding: "92px 52px 50px",
        textAlign: "center",
        background: "linear-gradient(180deg, #FAFBFD 0%, #FAF7F2 100%)",
        borderBottom: "1px solid rgba(10,22,40,0.10)",
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .shop-hero-section { padding: 72px 20px 40px !important; }
          .shop-hero-browse { display: none !important; }
          .shop-hero-tabs-wrap { padding: 6px !important; }
          .shop-hero-tabs { gap: 6px !important; }
          .shop-hero-tab { min-width: 112px !important; padding: 10px 12px !important; }
          .shop-hero-tabs.single { display: flex !important; justify-content: center !important; }
          .shop-hero-tabs.single .shop-hero-tab { width: auto !important; min-width: 152px !important; }
          .shop-hero-options { gap: 12px !important; }
          .shop-hero-option { width: 102px !important; min-height: 110px !important; padding: 14px 10px !important; }
        }
      `}</style>

      <div
        style={{
          fontSize: "9px",
          letterSpacing: ".3em",
          textTransform: "uppercase",
          color: "#6A6A6A",
          marginBottom: "20px",
        }}
      >
        <Link
          href="/"
          style={{ color: "#6A6A6A", textDecoration: "none", transition: "color .3s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#0A1628")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6A6A6A")}
        >
          Home
        </Link>
        <span style={{ margin: "0 10px", color: "#7F8898" }}>/</span>
        <span style={{ color: "#0A1628" }}>Shop</span>
      </div>

      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: "clamp(46px, 6vw, 76px)",
          fontWeight: 300,
          color: "#0A1628",
          letterSpacing: ".02em",
          lineHeight: 1.1,
          marginBottom: "14px",
        }}
      >
        {title.includes(' ') ? (
          <>
            {title.split(' ').slice(0, -1).join(' ')}{' '}
            <em style={{ fontStyle: "normal", color: "#0A1628" }}>{title.split(' ').slice(-1)}</em>
          </>
        ) : (
          <em style={{ fontStyle: "normal", color: "#0A1628" }}>{title}</em>
        )}
      </h1>

      <p
        style={{
          fontSize: "12px",
          letterSpacing: ".12em",
          color: "#6A6A6A",
          maxWidth: "540px",
          margin: "0 auto",
          lineHeight: 1.8,
        }}
      >
        {subtitle}
      </p>

      {browseSections.length > 0 && activeSection ? (
        <div
          className="shop-hero-browse"
          style={{
            maxWidth: "1120px",
            margin: "30px auto 0",
            borderTop: "1px solid rgba(10,22,40,0.08)",
            paddingTop: "22px",
          }}
        >
          <div
            className="shop-hero-tabs-wrap"
            style={{
              width: tabsWrapWidth,
              maxWidth: "100%",
              margin: "0 auto 22px",
              padding: "5px",
              border: "1px solid rgba(10,22,40,0.12)",
              borderRadius: "24px",
              background: "rgba(255,255,255,0.76)",
              boxShadow: "0 18px 48px rgba(10,22,40,0.06)",
            }}
          >
            <div
              className={`shop-hero-tabs${browseSections.length === 1 ? ' single' : ''}`}
              style={{
                display: browseSections.length === 1 ? "flex" : "grid",
                justifyContent: browseSections.length === 1 ? "center" : undefined,
                gridTemplateColumns: browseSections.length === 1 ? undefined : `repeat(${Math.max(1, browseSections.length)}, minmax(0, 1fr))`,
                gap: "5px",
              }}
            >
              {browseSections.map((section) => {
                const isActive = section.id === activeSection.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    className="shop-hero-tab"
                    onClick={() => setActiveSectionId(section.id)}
                    style={{
                      minWidth: "0",
                      width: browseSections.length === 1 ? "auto" : "100%",
                      padding: "10px 14px",
                      borderRadius: "14px",
                      border: isActive ? "1px solid rgba(10,22,40,0.24)" : "1px solid transparent",
                      background: isActive ? "#FFFFFF" : "transparent",
                      color: "#0A1628",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all .2s ease",
                      boxShadow: isActive ? "0 6px 16px rgba(10,22,40,0.05)" : "none",
                    }}
                  >
                    {section.iconUrl ? (
                      <img
                        src={section.iconUrl}
                        alt={section.title}
                        style={{
                          width: "16px",
                          height: "16px",
                          objectFit: "contain",
                          flexShrink: 0,
                        }}
                      />
                    ) : null}
                    <span
                      style={{
                        fontSize: "12px",
                        letterSpacing: ".01em",
                        fontWeight: 500,
                      }}
                    >
                      {section.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="shop-hero-options"
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "10px 12px",
            }}
          >
            {activeSection.options.map((option) => (
              <Link
                key={`${activeSection.id}-${option.label}`}
                href={option.href}
                className="shop-hero-option"
                style={{
                  width: "102px",
                  minHeight: "98px",
                  padding: "12px 10px",
                  border: option.type === "swatch" ? "1px solid rgba(10,22,40,0.12)" : "2px solid transparent",
                  borderRadius: "16px",
                  background: "#FFFFFF",
                  color: "#0A1628",
                  textDecoration: "none",
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all .25s ease",
                  boxShadow: "0 10px 26px rgba(10,22,40,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#111111";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = option.type === "swatch" ? "rgba(10,22,40,0.12)" : "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {option.type === "swatch" ? (
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "999px",
                      background: "#D9D9D9",
                      border: "1px solid rgba(10,22,40,0.12)",
                      flexShrink: 0,
                    }}
                  />
                ) : option.type === "icon" && option.iconUrl ? (
                  <img
                    src={option.iconUrl}
                    alt={option.label}
                    style={{
                      width: "30px",
                      height: "30px",
                      objectFit: "contain",
                      flexShrink: 0,
                    }}
                  />
                ) : null}
                <span
                  style={{
                    fontSize: "11px",
                    letterSpacing: ".01em",
                    textTransform: "none",
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  {option.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
