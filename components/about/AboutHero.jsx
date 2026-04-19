"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { count: 2617, suffix: "+", label: "Loose Diamonds" },
  { count: 28,   suffix: "+", label: "Countries Served" },
  { count: 11,   suffix: "+", label: "Years in Trade" },
  { count: 100,  suffix: "%", label: "Certified" },
];

function useCountUp(target, duration = 1800) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const easeOut = (t) => 1 - Math.pow(1 - t, 3);
          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setValue(Math.floor(target * easeOut(progress)));
            if (progress < 1) requestAnimationFrame(tick);
            else setValue(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

function StatCard({ count, suffix, label }) {
  const { value, ref } = useCountUp(count);
  return (
    <div ref={ref} className="text-center">
      <div
        style={{
          fontFamily: "var(--numeric)",
          fontSize: "46px",
          fontWeight: 400,
          color: "#B8922A",
          lineHeight: 1,
        }}
      >
        {value.toLocaleString("en-US")}
        {suffix}
      </div>
      <div
        style={{
          fontSize: "9px",
          fontWeight: 400,
          letterSpacing: ".26em",
          color: "#7A7060",
          textTransform: "uppercase",
          marginTop: "10px",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function AboutHero() {
  return (
    <section
      style={{
        padding: "100px 52px 80px",
        background: "linear-gradient(180deg, #FBF9F5 0%, #F6F2EA 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @media (max-width: 1024px) {
          .about-hero-inner { grid-template-columns: 1fr !important; gap: 40px !important; }
          .about-hero-section { padding: 70px 28px !important; }
        }
        @media (max-width: 640px) {
          .about-hero-section { padding: 60px 20px !important; }
          .about-giant-text { font-size: clamp(48px, 10vw, 80px) !important; }
        }
      `}</style>

      <div
        className="about-hero-inner about-hero-section"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "70px",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left — text */}
        <div>
          {/* Gold line */}
          <div style={{ width: "60px", height: "1px", background: "#B8922A", marginBottom: "24px" }} />

          {/* Eyebrow */}
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
              gap: "12px",
            }}
          >
            <span style={{ width: "24px", height: "1px", background: "#B8922A", display: "inline-block" }} />
            Our Story
          </div>

          {/* Heading */}
          <h1
            className="about-giant-text"
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(52px, 7vw, 104px)",
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: "-.01em",
              color: "#14120D",
              marginBottom: "28px",
            }}
          >
            Two Friends.
            <br />
            <em style={{ color: "#B8922A", fontStyle: "normal", fontWeight: 400 }}>One Vision.</em>
          </h1>

          {/* Body */}
          <p
            style={{
              fontSize: "14px",
              fontWeight: 300,
              lineHeight: 2,
              color: "#3A3628",
              letterSpacing: ".02em",
              maxWidth: "560px",
              marginBottom: "32px",
            }}
          >
            House of Diams was born in Surat, India — the diamond capital of the world — from the
            partnership of Krish Babariya and Akshar Korat. What started as a passion for ethical,
            accessible luxury has grown into a globally trusted brand crafting fine jewellery with
            natural and CVD lab-grown diamonds for discerning clients in over 40 countries.
          </p>

          {/* CTA */}
          <a
            href="/contact"
            className="group"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "10px",
              fontWeight: 400,
              letterSpacing: ".28em",
              color: "#FBF9F5",
              background: "#14120D",
              padding: "16px 34px",
              border: "none",
              cursor: "pointer",
              textTransform: "uppercase",
              textDecoration: "none",
              position: "relative",
              overflow: "hidden",
              transition: "transform .4s, box-shadow .4s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(184,146,42,0.18)";
              e.currentTarget.querySelector(".btn-fill").style.transform = "translateY(0)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.querySelector(".btn-fill").style.transform = "translateY(100%)";
            }}
          >
            <span
              className="btn-fill"
              style={{
                position: "absolute",
                inset: 0,
                background: "#B8922A",
                zIndex: 0,
                transform: "translateY(100%)",
                transition: "transform .45s cubic-bezier(.77,0,.18,1)",
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>Get In Touch</span>
          </a>
        </div>

        {/* Right — Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "28px",
            background: "#fff",
            padding: "40px",
            border: "1px solid rgba(20,18,13,0.10)",
          }}
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
