"use client";

import { useEffect, useState } from "react";

export default function TimelineSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadTimeline() {
      try {
        const response = await fetch("/api/public/about/timeline", { cache: "no-store" });
        const payload = await response.json();
        if (!active) return;
        setItems(Array.isArray(payload?.items) ? payload.items : []);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTimeline();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <section
        style={{
          padding: "110px 52px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", color: "#6A6A6A" }}>Loading timeline...</div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section
        style={{
          padding: "110px 52px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", color: "#6A6A6A" }}>
          Timeline content is not set yet.
        </div>
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
          .timeline-section { padding: 70px 28px !important; }
          .timeline-row {
            flex-direction: column !important;
            gap: 28px !important;
            padding: 0 !important;
          }
          .timeline-row::before {
            top: 0 !important; bottom: 0 !important;
            left: 7px !important; right: auto !important;
            width: 1px !important; height: auto !important;
          }
          .timeline-item {
            text-align: left !important;
            display: flex !important;
            gap: 18px !important;
            align-items: center !important;
            flex: unset !important;
          }
          .timeline-dot { margin: 0 !important; }
        }
        @media (max-width: 640px) {
          .timeline-section { padding: 60px 20px !important; }
        }
      `}</style>

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
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
          Our Journey
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
          <em style={{ fontStyle: "normal", color: "#0A1628", fontWeight: 400 }}>Milestones</em>
        </h2>
      </div>

      {/* Timeline row */}
      <div
        className="timeline-row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          position: "relative",
          padding: "0 20px",
        }}
      >
        {/* Horizontal connector line */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "40px",
            right: "40px",
            height: "1px",
            background: "rgba(10,22,40,0.25)",
            pointerEvents: "none",
          }}
        />

        {items.map((m, i) => (
          <div
            key={m.id ?? i}
            className="timeline-item"
            style={{ textAlign: "center", position: "relative", flex: 1 }}
          >
            {/* Dot */}
            <div
              className="timeline-dot"
              style={{
                width: "14px",
                height: "14px",
                background: "#0A1628",
                borderRadius: "50%",
                margin: "0 auto 16px",
                position: "relative",
                zIndex: 1,
                border: "3px solid #FAFBFD",
                boxShadow: "0 0 0 1px #0A1628",
              }}
            />

            {/* Year */}
            <div
              style={{
                fontFamily: "var(--numeric)",
                fontSize: "26px",
                fontWeight: 400,
                color: "#0A1628",
                marginBottom: "4px",
              }}
            >
              {m.year}
            </div>

            {/* Label */}
            <div
              style={{
                fontSize: "10px",
                fontWeight: 300,
                letterSpacing: ".14em",
                color: "#6A6A6A",
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
