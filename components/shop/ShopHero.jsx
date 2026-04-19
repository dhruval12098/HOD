"use client";

export default function ShopHero() {
  return (
    <section
      style={{
        padding: "80px 52px 50px",
        textAlign: "center",
        background: "linear-gradient(180deg, #FBF9F5 0%, #F6F2EA 100%)",
        borderBottom: "1px solid rgba(20,18,13,0.10)",
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .shop-hero-section { padding: 60px 20px 40px !important; }
        }
      `}</style>

      {/* Breadcrumb */}
      <div
        style={{
          fontSize: "9px",
          letterSpacing: ".3em",
          textTransform: "uppercase",
          color: "#7A7060",
          marginBottom: "20px",
        }}
      >
        <a
          href="/"
          style={{ color: "#7A7060", textDecoration: "none", transition: "color .3s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#B8922A")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#7A7060")}
        >
          Home
        </a>
        <span style={{ margin: "0 10px", color: "#B0A898" }}>/</span>
        <span style={{ color: "#14120D" }}>Shop</span>
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: "clamp(46px, 6vw, 76px)",
          fontWeight: 300,
          color: "#14120D",
          letterSpacing: ".02em",
          lineHeight: 1.1,
          marginBottom: "14px",
        }}
      >
        Our <em style={{ fontStyle: "normal", color: "#B8922A" }}>Collection</em>
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "12px",
          letterSpacing: ".12em",
          color: "#7A7060",
          maxWidth: "540px",
          margin: "0 auto",
          lineHeight: 1.8,
        }}
      >
        Browse our curated selection of fine jewellery with natural and CVD diamonds. Every piece
        certified, every stone responsibly sourced.
      </p>
    </section>
  );
}
