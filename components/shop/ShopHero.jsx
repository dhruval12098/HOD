'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * @typedef {{ id: string; title: string; iconUrl?: string | null; href?: string | null; options: { label: string; href: string; type?: 'default' | 'swatch' | 'icon', iconUrl?: string | null, colorHex?: string | null }[], emphasis?: 'section' | 'group' }} ShopHeroBrowseSection
 */

/**
 * @param {{
 *   title?: string
 *   subtitle?: string
 *   desktopImageUrl?: string
 *   mobileImageUrl?: string
 *   ctaLabel?: string
 *   ctaHref?: string
 *   bannerEnabled?: boolean
 *   browseSections?: ShopHeroBrowseSection[]
 * }} props
 */
export default function ShopHero({
  title = 'Our Collection',
  subtitle = 'Browse our curated selection of fine jewellery with natural and CVD diamonds. Every piece certified, every stone responsibly sourced.',
  desktopImageUrl = '',
  mobileImageUrl = '',
  ctaLabel = '',
  ctaHref = '',
  bannerEnabled = false,
  browseSections = [],
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRouteKey = `${pathname}?${searchParams?.toString() ?? ''}`;

  const matchedSectionId = useMemo(() => {
    const currentParams = searchParams?.toString() ?? '';

    for (const section of browseSections) {
      if (section.href) {
        try {
          const target = new URL(section.href, 'https://houseofdiams.local');
          const targetPath = target.pathname;
          const targetParams = target.searchParams.toString();

          if (targetPath === pathname && targetParams === currentParams) {
            return section.id;
          }
        } catch {}
      }

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
  const activeSectionIndex = Math.max(
    0,
    browseSections.findIndex((section) => section.id === activeSection?.id)
  );
  const hasBannerImage = bannerEnabled && Boolean(desktopImageUrl || mobileImageUrl);

  return (
    <section
      className="shop-hero-section"
      style={{
        position: "relative",
        textAlign: "center",
        background: "#FFFFFF",
        borderBottom: "1px solid rgba(10,22,40,0.10)",
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .shop-hero-top { padding: ${hasBannerImage ? '0' : '56px 16px 28px'} !important; }
          .shop-hero-banner-content { padding: ${hasBannerImage ? '88px 16px 28px' : '0'} !important; }
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
        className="shop-hero-top"
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: hasBannerImage ? undefined : "auto",
          padding: hasBannerImage ? "0" : "92px 52px 40px",
          background: hasBannerImage ? "#0A1628" : "linear-gradient(180deg, #FAFBFD 0%, #FAF7F2 100%)",
        }}
      >
        {hasBannerImage ? (
          <>
            <div className="relative h-[360px] sm:hidden">
              <picture>
                {mobileImageUrl ? <source media="(max-width: 960px)" srcSet={mobileImageUrl} /> : null}
                <img
                  src={desktopImageUrl || mobileImageUrl}
                  alt={title}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              </picture>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(90deg, rgba(10,22,40,0.82) 0%, rgba(10,22,40,0.58) 34%, rgba(10,22,40,0.18) 66%, rgba(10,22,40,0) 100%)",
                }}
              />
            </div>
            <div className="relative hidden sm:block aspect-[1920/620]">
              <picture>
                <img
                  src={desktopImageUrl || mobileImageUrl}
                  alt={title}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              </picture>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(90deg, rgba(10,22,40,0.82) 0%, rgba(10,22,40,0.58) 34%, rgba(10,22,40,0.18) 66%, rgba(10,22,40,0) 100%)",
                }}
              />
            </div>
          </>
        ) : null}

        <div
          className="shop-hero-banner-content"
          style={{
            position: "relative",
            zIndex: 1,
            padding: hasBannerImage ? "140px 52px 46px" : undefined,
            inset: hasBannerImage ? 0 : undefined,
            display: hasBannerImage ? "flex" : undefined,
            flexDirection: hasBannerImage ? "column" : undefined,
            justifyContent: hasBannerImage ? "flex-end" : undefined,
            position: hasBannerImage ? "absolute" : "relative",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              letterSpacing: ".3em",
              textTransform: "uppercase",
              color: hasBannerImage ? "rgba(255,255,255,0.72)" : "#6A6A6A",
              marginBottom: "20px",
            }}
          >
            <Link
              href="/"
              style={{ color: hasBannerImage ? "rgba(255,255,255,0.72)" : "#6A6A6A", textDecoration: "none", transition: "color .3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = hasBannerImage ? "#FFFFFF" : "#0A1628")}
              onMouseLeave={(e) => (e.currentTarget.style.color = hasBannerImage ? "rgba(255,255,255,0.72)" : "#6A6A6A")}
            >
              Home
            </Link>
            <span style={{ margin: "0 10px", color: hasBannerImage ? "rgba(255,255,255,0.42)" : "#7F8898" }}>/</span>
            <span style={{ color: hasBannerImage ? "#FFFFFF" : "#0A1628" }}>Shop</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(46px, 6vw, 76px)",
              fontWeight: 300,
              color: hasBannerImage ? "#FFFFFF" : "#0A1628",
              letterSpacing: ".02em",
              lineHeight: 1.1,
              marginBottom: "14px",
            }}
          >
            {title.includes(' ') ? (
              <>
                {title.split(' ').slice(0, -1).join(' ')}{' '}
                <em style={{ fontStyle: "normal", color: hasBannerImage ? "#FFFFFF" : "#0A1628" }}>{title.split(' ').slice(-1)}</em>
              </>
            ) : (
              <em style={{ fontStyle: "normal", color: hasBannerImage ? "#FFFFFF" : "#0A1628" }}>{title}</em>
            )}
          </h1>

          <p
            style={{
              fontSize: "12px",
              letterSpacing: ".12em",
              color: hasBannerImage ? "rgba(255,255,255,0.82)" : "#6A6A6A",
              maxWidth: "540px",
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            {subtitle}
          </p>

          {hasBannerImage && ctaLabel && ctaHref ? (
            <div style={{ marginTop: "26px" }}>
              <Link
                href={ctaHref}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 28px",
                  borderRadius: "999px",
                  background: "#FFFFFF",
                  color: "#0A1628",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  letterSpacing: ".24em",
                  fontSize: "10px",
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <span>{ctaLabel}</span>
                <span style={{ fontSize: "14px" }}>&rarr;</span>
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {browseSections.length > 0 && activeSection ? (
        <div
          className="shop-hero-browse"
          style={{
            maxWidth: "1120px",
            margin: "0 auto",
            padding: "28px 52px 34px",
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
              background: "#FFFFFF",
            }}
          >
            <div
              className={`shop-hero-tabs${browseSections.length === 1 ? ' single' : ''}`}
              style={{
                position: "relative",
                isolation: "isolate",
                display: browseSections.length === 1 ? "flex" : "grid",
                justifyContent: browseSections.length === 1 ? "center" : undefined,
                gridTemplateColumns: browseSections.length === 1 ? undefined : `repeat(${Math.max(1, browseSections.length)}, minmax(0, 1fr))`,
                gap: "5px",
              }}
            >
              {browseSections.length > 1 ? (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `calc((100% - ${(browseSections.length - 1) * 5}px) / ${browseSections.length})`,
                    borderRadius: "14px",
                    background: "#0A1628",
                    transform: `translateX(calc(${activeSectionIndex} * (100% + 5px)))`,
                    transition: "transform .38s cubic-bezier(0.22, 1, 0.36, 1)",
                    zIndex: 0,
                  }}
                />
              ) : null}
              {browseSections.map((section) => {
                let sectionRouteKey = '';
                if (section.href) {
                  try {
                    const target = new URL(section.href, 'https://houseofdiams.local');
                    sectionRouteKey = `${target.pathname}?${target.searchParams.toString()}`;
                  } catch {}
                }
                const isActive = sectionRouteKey ? sectionRouteKey === currentRouteKey : section.id === activeSection.id;
                const tabContent = (
                  <>
                    {section.iconUrl ? (
                      <img
                        src={section.iconUrl}
                        alt={section.title}
                        style={{
                          width: "16px",
                          height: "16px",
                          objectFit: "contain",
                          flexShrink: 0,
                          filter: isActive ? "brightness(0) invert(1)" : "none",
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
                  </>
                );

                const commonTabStyle = {
                  minWidth: "0",
                  width: browseSections.length === 1 ? "auto" : "100%",
                  padding: "10px 14px",
                  position: "relative",
                  zIndex: 1,
                  borderRadius: "14px",
                  border: browseSections.length === 1 && isActive ? "1px solid #0A1628" : "1px solid transparent",
                  background: browseSections.length === 1 && isActive ? "#0A1628" : "transparent",
                  color: isActive ? "#FFFFFF" : "#0A1628",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "color .25s ease, border-color .25s ease",
                  textDecoration: "none",
                };

                if (section.href) {
                  return (
                    <Link key={section.id} href={section.href} className="shop-hero-tab" style={commonTabStyle}>
                      {tabContent}
                    </Link>
                  );
                }

                return (
                  <button
                    key={section.id}
                    type="button"
                    className="shop-hero-tab"
                    onClick={() => setActiveSectionId(section.id)}
                    style={commonTabStyle}
                  >
                    {tabContent}
                  </button>
                );
              })}
            </div>
          </div>

          {activeSection.options.length > 0 ? (
            <div
              className="shop-hero-options"
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "10px 12px",
              }}
            >
              {activeSection.options.map((option) => {
                const isTextOnly = option.type !== "swatch" && !(option.type === "icon" && option.iconUrl);

                return (
                <Link
                  key={`${activeSection.id}-${option.label}`}
                  href={option.href}
                  className="shop-hero-option"
                  style={{
                    width: isTextOnly ? "auto" : "110px",
                    minWidth: isTextOnly ? "148px" : undefined,
                    minHeight: isTextOnly ? "46px" : "104px",
                    padding: isTextOnly ? "12px 20px" : "14px 10px",
                    border: "1px solid transparent",
                    borderRadius: isTextOnly ? "14px" : "16px",
                    background: "transparent",
                    color: "#0A1628",
                    textDecoration: "none",
                    display: "inline-flex",
                    flexDirection: isTextOnly ? "row" : "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: isTextOnly ? "8px" : "10px",
                    transition: "all .25s ease",
                    boxShadow: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(10,22,40,0.24)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  {option.type === "swatch" ? (
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "999px",
                        background: option.colorHex || "#D9D9D9",
                        border: "1px solid rgba(10,22,40,0.12)",
                        flexShrink: 0,
                      }}
                    />
                  ) : option.type === "icon" && option.iconUrl ? (
                    <img
                      src={option.iconUrl}
                      alt={option.label}
                      style={{
                        width: "38px",
                        height: "38px",
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                    />
                  ) : null}
                  <span
                    style={{
                      fontSize: "12px",
                      letterSpacing: ".01em",
                      textTransform: "none",
                      fontWeight: 500,
                      lineHeight: 1.2,
                      whiteSpace: isTextOnly ? "nowrap" : "normal",
                    }}
                  >
                    {option.label}
                  </span>
                </Link>
              )})}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
