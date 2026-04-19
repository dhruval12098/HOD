"use client";

const VALUES = [
  {
    symbol: "◇",
    title: "Ethical Sourcing",
    desc: "Our CVD stones are grown in controlled conditions — zero conflict. Our natural diamonds are Kimberley-compliant and fully traceable. Integrity in every piece.",
  },
  {
    symbol: "✦",
    title: "Master Craftsmanship",
    desc: "Every piece hand-set by Surat's finest artisans with decades of diamond jewellery expertise and uncompromising quality standards.",
  },
  {
    symbol: "◈",
    title: "Global Reach",
    desc: "From Surat to 40+ countries. Serving private clients, luxury retailers and wholesale buyers across every continent.",
  },
];

function ValueCard({ symbol, title, desc }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "48px 36px",
        border: "1px solid rgba(20,18,13,0.10)",
        textAlign: "center",
        transition: "transform .5s, border-color .5s, box-shadow .5s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.borderColor = "rgba(184,146,42,0.25)";
        e.currentTarget.style.boxShadow = "0 24px 60px rgba(20,18,13,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(20,18,13,0.10)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Symbol */}
      <div
        style={{
          fontSize: "40px",
          color: "#B8922A",
          marginBottom: "18px",
          fontFamily: "var(--serif)",
        }}
      >
        {symbol}
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: "22px",
          fontWeight: 400,
          color: "#14120D",
          marginBottom: "12px",
          letterSpacing: ".02em",
        }}
      >
        {title}
      </div>

      {/* Desc */}
      <p
        style={{
          fontSize: "12px",
          fontWeight: 300,
          lineHeight: 1.9,
          color: "#7A7060",
          letterSpacing: ".02em",
        }}
      >
        {desc}
      </p>
    </div>
  );
}

export default function ValuesSection() {
  return (
    <section
      style={{
        padding: "110px 52px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <style>{`
        @media (max-width: 1024px) {
          .values-section { padding: 70px 28px !important; }
          .values-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .values-section { padding: 60px 20px !important; }
        }
      `}</style>

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 400,
            letterSpacing: ".32em",
            color: "#B8922A",
            textTransform: "uppercase",
            marginBottom: "18px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <span style={{ width: "24px", height: "1px", background: "#B8922A", display: "inline-block" }} />
          What Drives Us
        </div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(40px, 5.5vw, 72px)",
            fontWeight: 300,
            letterSpacing: ".02em",
            color: "#14120D",
            lineHeight: 1.05,
          }}
        >
          Our <em style={{ fontStyle: "normal", color: "#B8922A", fontWeight: 400 }}>Values</em>
        </h2>
      </div>

      {/* Grid */}
      <div
        className="values-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "28px",
        }}
      >
        {VALUES.map((v) => (
          <ValueCard key={v.title} {...v} />
        ))}
      </div>
    </section>
  );
}
