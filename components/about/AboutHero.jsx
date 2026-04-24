"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { count: 2617, suffix: "+", label: "Loose Diamonds" },
  { count: 28, suffix: "+", label: "Countries Served" },
  { count: 11, suffix: "+", label: "Years in Trade" },
  { count: 100, suffix: "%", label: "Certified" },
];

function useCountUp(target, duration = 1800) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
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
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

function StatCard({ count, suffix, label }) {
  const { value, ref } = useCountUp(count);
  return (
    <div ref={ref} className="text-center">
      <div style={{ fontFamily: "var(--numeric)", fontSize: "46px", fontWeight: 400, color: "#0A1628", lineHeight: 1 }}>
        {value.toLocaleString("en-US")}
        {suffix}
      </div>
      <div style={{ fontSize: "9px", fontWeight: 400, letterSpacing: ".26em", color: "#6A6A6A", textTransform: "uppercase", marginTop: "10px" }}>
        {label}
      </div>
    </div>
  );
}

export default function AboutHero({ content }) {
  const eyebrow = content?.eyebrow ?? "Our Story";
  const heading = content?.heading ?? "Two Friends.\nOne Vision.";
  const subtitle =
    content?.subtitle ??
    "House of Diams was born in Surat, India — the diamond capital of the world — from the partnership of Krish Babariya and Akshar Korat.";

  return (
    <section style={{ padding: "100px 52px 80px", background: "linear-gradient(180deg, #FAFBFD 0%, #FAF7F2 100%)", position: "relative", overflow: "hidden" }}>
      <div className="about-hero-inner about-hero-section" style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "70px", alignItems: "center", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ width: "60px", height: "1px", background: "#0A1628", marginBottom: "24px" }} />
          <div style={{ fontSize: "10px", fontWeight: 400, letterSpacing: ".32em", color: "#0A1628", textTransform: "uppercase", marginBottom: "18px", display: "inline-flex", alignItems: "center", gap: "12px" }}>
            <span style={{ width: "24px", height: "1px", background: "#0A1628", display: "inline-block" }} />
            {eyebrow}
          </div>
          <h1 className="about-giant-text" style={{ fontFamily: "var(--serif)", fontSize: "clamp(52px, 7vw, 104px)", fontWeight: 300, lineHeight: 1, letterSpacing: "-.01em", color: "#0A1628", marginBottom: "28px", whiteSpace: "pre-line" }}>
            {heading}
          </h1>
          <p style={{ fontSize: "14px", fontWeight: 300, lineHeight: 2, color: "#253246", letterSpacing: ".02em", maxWidth: "560px", marginBottom: "32px" }}>
            {subtitle}
          </p>
          <a href="/contact" className="group" style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontSize: "10px", fontWeight: 400, letterSpacing: ".28em", color: "#FAFBFD", background: "#0A1628", padding: "16px 34px", border: "none", cursor: "pointer", textTransform: "uppercase", textDecoration: "none", position: "relative", overflow: "hidden", transition: "transform .4s, box-shadow .4s" }}>
            <span style={{ position: "relative", zIndex: 1 }}>Get In Touch</span>
          </a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", background: "#fff", padding: "40px", border: "1px solid rgba(10,22,40,0.10)" }}>
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  );
}
