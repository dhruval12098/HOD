"use client";

const MILESTONES = [
  { year: "2014", label: "Founded in Surat, Gujarat", future: false },
  { year: "2016", label: "First international sale", future: false },
  { year: "2018", label: "B2B wholesale launched", future: false },
  { year: "2021", label: "Expansion into Middle East & Europe", future: false },
  { year: "2024", label: "3,000+ bespoke orders delivered", future: false },
  { year: "2025", label: "Serving 28+ countries worldwide", future: false },
];

export default function TimelineSection() {
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
          Our Journey
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
          <em style={{ fontStyle: "normal", color: "#B8922A", fontWeight: 400 }}>Milestones</em>
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
            background: "rgba(184,146,42,0.25)",
            pointerEvents: "none",
          }}
        />

        {MILESTONES.map((m, i) => (
          <div
            key={i}
            className="timeline-item"
            style={{ textAlign: "center", position: "relative", flex: 1 }}
          >
            {/* Dot */}
            <div
              className="timeline-dot"
              style={{
                width: "14px",
                height: "14px",
                background: m.future ? "#FBF9F5" : "#B8922A",
                borderRadius: "50%",
                margin: "0 auto 16px",
                position: "relative",
                zIndex: 1,
                border: "3px solid #FBF9F5",
                boxShadow: `0 0 0 1px ${m.future ? "#7A7060" : "#B8922A"}`,
              }}
            />

            {/* Year */}
            <div
              style={{
                fontFamily: "var(--numeric)",
                fontSize: "26px",
                fontWeight: 400,
                color: m.future ? "#7A7060" : "#14120D",
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
                color: "#7A7060",
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
