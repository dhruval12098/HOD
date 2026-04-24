"use client";

import { useEffect, useState } from "react";

function ValueCard({ iconPath, title, desc }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod';
  const iconUrl = iconPath && supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/${bucket}/${iconPath}` : '';

  return (
    <div
      style={{
        background: "#fff",
        padding: "48px 36px",
        border: "1px solid rgba(10,22,40,0.10)",
        textAlign: "center",
        transition: "transform .5s, border-color .5s, box-shadow .5s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.borderColor = "rgba(10,22,40,0.25)";
        e.currentTarget.style.boxShadow = "0 24px 60px rgba(10,22,40,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(10,22,40,0.10)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ marginBottom: "18px", display: "flex", justifyContent: "center" }}>
        {iconUrl ? (
          <img src={iconUrl} alt={title} style={{ width: "40px", height: "40px", objectFit: "contain" }} />
        ) : null}
      </div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: "22px",
          fontWeight: 400,
          color: "#0A1628",
          marginBottom: "12px",
          letterSpacing: ".02em",
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontSize: "12px",
          fontWeight: 300,
          lineHeight: 1.9,
          color: "#6A6A6A",
          letterSpacing: ".02em",
        }}
      >
        {desc}
      </p>
    </div>
  );
}

export default function ValuesSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadValues() {
      try {
        const response = await fetch("/api/public/about/values", { cache: "no-store" });
        const payload = await response.json();
        if (!active) return;
        setItems(Array.isArray(payload?.items) ? payload.items : []);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadValues();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <section style={{ padding: "110px 52px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", color: "#6A6A6A" }}>Loading values...</div>
      </section>
    );
  }

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

      <div style={{ textAlign: "center", marginBottom: "56px" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 400,
            letterSpacing: ".32em",
            color: "#0A1628",
            textTransform: "uppercase",
            marginBottom: "18px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <span style={{ width: "24px", height: "1px", background: "#0A1628", display: "inline-block" }} />
          What Drives Us
        </div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(40px, 5.5vw, 72px)",
            fontWeight: 300,
            letterSpacing: ".02em",
            color: "#0A1628",
            lineHeight: 1.05,
          }}
        >
          Our <em style={{ fontStyle: "normal", color: "#0A1628", fontWeight: 400 }}>Values</em>
        </h2>
      </div>

      <div
        className="values-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "28px",
        }}
      >
        {items.map((v) => (
          <ValueCard key={v.id ?? v.title} iconPath={v.icon_path} title={v.title} desc={v.description} />
        ))}
      </div>
    </section>
  );
}
