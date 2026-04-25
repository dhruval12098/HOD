"use client";

import { useEffect, useState } from "react";

function buildImageUrl(path) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? "hod";
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return base ? `${base}/storage/v1/object/public/${bucket}/${path}` : path;
}

export default function FoundersSection() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/public/about/founders", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) return;
      setItems(payload?.items ?? []);
    };
    load();
  }, []);

  return (
    <section style={{ padding: "110px 52px", maxWidth: "1400px", margin: "0 auto" }} className="founders-section">
      <style>{`
        @media (max-width: 1024px) {
          .founders-section { padding: 70px 28px !important; }
          .founders-grid { grid-template-columns: 1fr !important; }
          .founder-card { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .founders-section { padding: 60px 20px !important; }
        }
      `}</style>
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
        <div style={{ fontSize: "10px", fontWeight: 400, letterSpacing: ".32em", color: "#0A1628", textTransform: "uppercase", marginBottom: "18px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          <span style={{ width: "24px", height: "1px", background: "#0A1628", display: "inline-block" }} />
          The Team
        </div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(40px, 5.5vw, 72px)", fontWeight: 300, letterSpacing: ".02em", color: "#0A1628", lineHeight: 1.05 }}>
          Meet the <em style={{ fontStyle: "normal", color: "#0A1628", fontWeight: 400 }}>Founders</em>
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "36px" }} className="founders-grid">
        {items.map((f) => (
          <div key={f.name} className="founder-card" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", background: "#fff", border: "1px solid rgba(10,22,40,0.10)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #FAF7F2, #F5F7FC)", display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1" }}>
              {f.image_path ? <img src={buildImageUrl(f.image_path)} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontFamily: "var(--serif)", fontSize: "80px", fontWeight: 400, color: "#0A1628" }}>{(f.name || "FD").slice(0, 2).toUpperCase()}</span>}
            </div>
            <div style={{ padding: "32px 28px" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "26px", fontWeight: 400, color: "#0A1628", marginBottom: "4px" }}>{f.name}</div>
              <div style={{ fontSize: "9px", fontWeight: 400, letterSpacing: ".28em", color: "#0A1628", textTransform: "uppercase", marginBottom: "18px" }}>{f.designation}</div>
              <p style={{ fontSize: "12px", fontWeight: 300, lineHeight: 1.9, color: "#6A6A6A", letterSpacing: ".02em" }}>{f.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
