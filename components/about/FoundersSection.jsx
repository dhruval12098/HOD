"use client";

const FOUNDERS = [
  {
    initials: "KB",
    name: "Krish Babariya",
    title: "Co-Founder · Creative Director",
    bio: "Krish leads product design, brand strategy and client relationships at House of Diams. With a deep passion for the craft and an eye for exceptional design, he shapes every piece's journey from concept to creation.",
  },
  {
    initials: "AK",
    name: "Akshar Korat",
    title: "Co-Founder · Operations Director",
    bio: "Akshar drives the operational backbone of House of Diams — sourcing, manufacturing partnerships and global B2B wholesale relationships. His expertise ensures every stone meets the highest international standards.",
  },
];

function FounderCard({ initials, name, title, bio }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.6fr",
        background: "#fff",
        border: "1px solid rgba(20,18,13,0.10)",
        overflow: "hidden",
        transition: "transform .5s, box-shadow .5s, border-color .5s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 24px 60px rgba(20,18,13,0.12)";
        e.currentTarget.style.borderColor = "rgba(184,146,42,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "rgba(20,18,13,0.10)";
      }}
    >
      {/* Visual / Monogram */}
      <div
        style={{
          background: "linear-gradient(135deg, #F6F2EA, #EEE7DA)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          aspectRatio: "1",
        }}
      >
        <span
          style={{
            fontFamily: "var(--serif)",
            fontSize: "80px",
            fontWeight: 400,
            color: "#B8922A",
            fontStyle: "normal",
          }}
        >
          {initials}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: "32px 28px" }}>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontSize: "26px",
            fontWeight: 400,
            color: "#14120D",
            marginBottom: "4px",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: "9px",
            fontWeight: 400,
            letterSpacing: ".28em",
            color: "#B8922A",
            textTransform: "uppercase",
            marginBottom: "18px",
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 300,
            lineHeight: 1.9,
            color: "#7A7060",
            letterSpacing: ".02em",
          }}
        >
          {bio}
        </p>
      </div>
    </div>
  );
}

export default function FoundersSection() {
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
          .founders-section-inner { padding: 70px 28px !important; }
          .founders-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .founders-section-inner { padding: 60px 20px !important; }
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
          The Team
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
          Meet the <em style={{ fontStyle: "normal", color: "#B8922A", fontWeight: 400 }}>Founders</em>
        </h2>
      </div>

      {/* Grid */}
      <div
        className="founders-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "36px",
        }}
      >
        {FOUNDERS.map((f) => (
          <FounderCard key={f.name} {...f} />
        ))}
      </div>
    </section>
  );
}
