"use client";

/**
 * @typedef {{ id: string; title: string; options: { label: string; href: string; type?: 'default' | 'swatch' }[] }} ShopHeroBrowseSection
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
  return (
    <section
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
        }
      `}</style>

      {/* Breadcrumb */}
      <div
        style={{
          fontSize: "9px",
          letterSpacing: ".3em",
          textTransform: "uppercase",
          color: "#6A6A6A",
          marginBottom: "20px",
        }}
      >
        <a
          href="/"
          style={{ color: "#6A6A6A", textDecoration: "none", transition: "color .3s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#0A1628")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6A6A6A")}
        >
          Home
        </a>
        <span style={{ margin: "0 10px", color: "#7F8898" }}>/</span>
        <span style={{ color: "#0A1628" }}>Shop</span>
      </div>

      {/* Heading */}
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

      {/* Subtitle */}
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

      {browseSections.length > 0 ? (
        <div
          style={{
            maxWidth: "1400px",
            margin: "38px auto 0",
            borderTop: "1px solid rgba(10,22,40,0.08)",
            paddingTop: "26px",
          }}
        >
          {browseSections.map((section) => (
            <div key={section.id} style={{ marginBottom: "18px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "14px 22px",
                }}
              >
                {section.options.map((option) => (
                  <a
                    key={`${section.id}-${option.label}`}
                    href={option.href}
                    style={{
                      minWidth: option.type === "swatch" ? "110px" : "unset",
                      padding: option.type === "swatch" ? "16px 18px" : "10px 18px",
                      border: "1px solid rgba(10,22,40,0.12)",
                      background: option.type === "swatch" ? "#FFFFFF" : "rgba(255,255,255,0.72)",
                      color: "#0A1628",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      transition: "all .25s ease",
                      boxShadow: option.type === "swatch" ? "0 8px 24px rgba(10,22,40,0.05)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#0A1628";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(10,22,40,0.12)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {option.type === "swatch" ? (
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "999px",
                          background: "#D9D9D9",
                          border: "1px solid rgba(10,22,40,0.12)",
                          flexShrink: 0,
                        }}
                      />
                    ) : null}
                    <span
                      style={{
                        fontSize: "11px",
                        letterSpacing: option.type === "swatch" ? ".12em" : ".18em",
                        textTransform: "uppercase",
                        fontWeight: 400,
                      }}
                    >
                      {option.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
