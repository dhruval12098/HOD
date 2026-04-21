'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CollectionProps {
  onEnquire?: (name: string) => void;
}

interface PanelData {
  index: number;
  name: string;
  desc: string;
  cta: string;
  ctaHref: string;
  gem: React.ReactNode;
  icon: React.ReactNode;
  bg: string;
  shadowColor: string;
}

// ── SVG Gems ──────────────────────────────────────────────────────────────────
const FineJewelleryGem = () => (
  <svg width="160" height="160" viewBox="0 0 110 110" fill="none">
    <path d="M55 15 Q75 38 72 68 Q65 92 55 94 Q45 92 38 68 Q35 38 55 15Z" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.12)" />
    <path d="M55 25 Q68 42 65 65 Q60 82 55 84 Q50 82 45 65 Q42 42 55 25Z" stroke="#B8922A" strokeWidth=".5" fill="rgba(184,146,42,0.06)" />
    <circle cx="48" cy="45" r="3" fill="#fff" opacity=".5" />
  </svg>
);

const EngagementRingsGem = () => (
  <svg width="160" height="160" viewBox="0 0 110 110" fill="none">
    <polygon points="55,15 85,35 77,85 33,85 25,35" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.12)" />
    <polygon points="55,25 75,40 69,75 41,75 35,40" stroke="#B8922A" strokeWidth=".5" fill="rgba(184,146,42,0.06)" />
    <line x1="55" y1="15" x2="33" y2="85" stroke="#B8922A" strokeWidth=".3" opacity=".4" />
    <line x1="55" y1="15" x2="77" y2="85" stroke="#B8922A" strokeWidth=".3" opacity=".4" />
    <circle cx="48" cy="35" r="3" fill="#fff" opacity=".5" />
  </svg>
);

const WeddingBandsGem = () => (
  <svg width="160" height="160" viewBox="0 0 110 110" fill="none">
    <circle cx="55" cy="55" r="36" stroke="#B8922A" strokeWidth="1" fill="none" />
    <circle cx="55" cy="55" r="28" stroke="#B8922A" strokeWidth=".5" fill="none" opacity=".4" />
    {[[55,19],[89,47],[76,86],[34,86],[21,47]].map(([cx,cy],i) => (
      <circle key={i} cx={cx} cy={cy} r="4" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".5" />
    ))}
  </svg>
);

const HipHopGem = () => (
  <svg width="140" height="140" viewBox="0 0 110 110" fill="none">
    {[22,42,62,82].map((cy,i) => (
      <g key={i}>
        <ellipse cx="55" cy={cy} rx="22" ry="8" stroke="#B8922A" strokeWidth="1" fill="rgba(212,168,64,0.15)" />
        <rect x="45" y={cy - 2} width="20" height="4" fill="#D4A840" />
      </g>
    ))}
  </svg>
);

const BespokeGem = () => (
  <svg width="160" height="160" viewBox="0 0 110 110" fill="none">
    <polygon points="55,15 73,30 68,90 42,90 37,30" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.15)" />
    <polygon points="28,40 38,48 33,80 18,80 13,48" stroke="#B8922A" strokeWidth=".8" fill="rgba(184,146,42,0.08)" />
    <polygon points="82,40 92,48 87,80 72,80 67,48" stroke="#B8922A" strokeWidth=".8" fill="rgba(184,146,42,0.08)" />
    <circle cx="55" cy="45" r="4" fill="rgba(255,255,255,0.4)" />
  </svg>
);

// ── Icons ─────────────────────────────────────────────────────────────────────
const FineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
    <path d="M12 3Q17 8 16 16Q14 21 12 22Q10 21 8 16Q7 8 12 3Z" stroke="#B8922A" strokeWidth="1.2" fill="rgba(184,146,42,0.15)" />
  </svg>
);
const RingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
    <polygon points="12,3 20,8 17,20 7,20 4,8" stroke="#B8922A" strokeWidth="1.2" fill="rgba(184,146,42,0.15)" />
  </svg>
);
const BandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
    <circle cx="12" cy="12" r="8" stroke="#B8922A" strokeWidth="1.2" fill="none" />
    <circle cx="12" cy="12" r="5" stroke="#B8922A" strokeWidth=".6" fill="rgba(184,146,42,0.1)" />
  </svg>
);
const HipHopIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
    <ellipse cx="12" cy="8" rx="7" ry="3" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.15)" />
    <rect x="9" y="7" width="6" height="2" fill="#D4A840" />
    <ellipse cx="12" cy="16" rx="7" ry="3" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.15)" />
    <rect x="9" y="15" width="6" height="2" fill="#D4A840" />
  </svg>
);
const BespokeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
    <polygon points="12,3 18,7 16,18 8,18 6,7" stroke="#B8922A" strokeWidth="1.2" fill="rgba(184,146,42,0.15)" />
    <polygon points="5,10 8,13 6,20 2,13" stroke="#B8922A" strokeWidth=".8" fill="rgba(184,146,42,0.08)" />
    <polygon points="19,10 22,13 18,20 16,13" stroke="#B8922A" strokeWidth=".8" fill="rgba(184,146,42,0.08)" />
  </svg>
);

// ── Panel data ────────────────────────────────────────────────────────────────
const PANELS: PanelData[] = [
  {
    index: 0,
    name: 'Fine Jewellery',
    desc: 'Necklaces, earrings, bracelets & pendants',
    cta: 'Shop Collection',
    ctaHref: '/shop?category=fine',
    gem: <FineJewelleryGem />,
    icon: <FineIcon />,
    bg: 'linear-gradient(135deg,#f8f6f0,#eee8d8)',
    shadowColor: 'rgba(0,0,0,0.5)',
  },
  {
    index: 1,
    name: 'Engagement Rings',
    desc: 'Solitaire, halo, pavé & three stone',
    cta: 'Shop Collection',
    ctaHref: '/shop?category=engagement',
    gem: <EngagementRingsGem />,
    icon: <RingIcon />,
    bg: 'linear-gradient(135deg,#f0ece4,#e5ddd0)',
    shadowColor: 'rgba(0,0,0,0.5)',
  },
  {
    index: 2,
    name: 'Wedding Bands',
    desc: 'For her & for him — classic to diamond-set',
    cta: 'Shop Collection',
    ctaHref: '/shop?category=wedding',
    gem: <WeddingBandsGem />,
    icon: <BandIcon />,
    bg: 'linear-gradient(135deg,#faf8f4,#f0ebe0)',
    shadowColor: 'rgba(0,0,0,0.5)',
  },
  {
    index: 3,
    name: 'Hip Hop',
    desc: 'Iced chains, grillz & statement pieces',
    cta: 'Shop Collection',
    ctaHref: '/shop?category=hiphop',
    gem: <HipHopGem />,
    icon: <HipHopIcon />,
    bg: '#0A0A0A',
    shadowColor: 'rgba(0,0,0,0.85)',
  },
  {
    index: 4,
    name: 'Bespoke',
    desc: 'Design your dream piece from scratch',
    cta: 'Start Designing',
    ctaHref: '/bespoke',
    gem: <BespokeGem />,
    icon: <BespokeIcon />,
    bg: 'linear-gradient(135deg,#f5f2ec,#ebe5d8)',
    shadowColor: 'rgba(0,0,0,0.5)',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Collection({ onEnquire }: CollectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gemRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const nameRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const descRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRefs   = useRef<(HTMLAnchorElement | null)[]>([]);
  const iconRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const activeTl  = useRef<gsap.core.Timeline | null>(null);
  const mounted   = useRef(false);

  // ── Helper: animate a single panel in or out ──
  const animatePanel = (tl: gsap.core.Timeline, i: number, toActive: boolean, initial: boolean) => {
    const panel = panelRefs.current[i];
    const gem   = gemRefs.current[i];
    const name  = nameRefs.current[i];
    const desc  = descRefs.current[i];
    const cta   = ctaRefs.current[i];
    const icon  = iconRefs.current[i];
    if (!panel) return;

    const dur    = initial ? 0 : 0.42;
    const ease   = 'power3.inOut';
    const offset = '<'; // all start together

    if (toActive) {
      // --- expand & style ---
      tl.to(panel, { flexGrow: 7, borderColor: '#ffffff', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', duration: dur, ease }, offset);
      if (gem)  tl.to(gem,  { scale: 1.1, opacity: 0.9, duration: initial ? 0 : 0.5, ease: 'power2.out' }, offset);
      if (icon) tl.to(icon, { borderColor: '#B8922A', backgroundColor: 'rgba(184,146,42,0.15)', duration: 0.28, ease: 'power1.out' }, offset);

      // --- text reveal after panel has opened a bit ---
      const textDelay = initial ? 0 : 0.18;
      if (name) tl.fromTo(name, { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, `<+=${textDelay}`);
      if (desc) tl.fromTo(desc, { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, `<+=0.06`);
      if (cta)  tl.fromTo(cta,  { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: 'back.out(1.6)' }, `<+=0.04`);
    } else {
      // --- collapse & hide text fast ---
      if (name) tl.to(name, { x: 20, opacity: 0, duration: initial ? 0 : 0.16, ease: 'power1.in' }, offset);
      if (desc) tl.to(desc, { x: 20, opacity: 0, duration: initial ? 0 : 0.16, ease: 'power1.in' }, offset);
      if (cta)  tl.to(cta,  { y: -12, opacity: 0, duration: initial ? 0 : 0.14, ease: 'power1.in' }, offset);
      tl.to(panel, { flexGrow: 1, borderColor: '#1a1a1a', boxShadow: 'none', duration: dur, ease }, offset);
      if (gem)  tl.to(gem,  { scale: 1, opacity: 0.7, duration: initial ? 0 : 0.32, ease: 'power2.out' }, offset);
      if (icon) tl.to(icon, { borderColor: '#444444', backgroundColor: 'rgba(20,20,20,0.85)', duration: 0.22, ease: 'power1.out' }, offset);
    }
  };

  const switchTo = (nextIndex: number, initial = false) => {
    activeTl.current?.kill();
    const tl = gsap.timeline();
    activeTl.current = tl;
    PANELS.forEach((_, i) => animatePanel(tl, i, i === nextIndex, initial));
  };

  // ── Mount: entrance stagger then reveal panel 0 ──
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    // Set all panels hidden
    gsap.set(panelRefs.current.filter(Boolean), { opacity: 0, x: -40 });
    // Hide all text/cta immediately
    gsap.set([...nameRefs.current, ...descRefs.current, ...ctaRefs.current].filter(Boolean), { opacity: 0, x: 20 });
    gsap.set(ctaRefs.current.filter(Boolean), { opacity: 0, y: -12 });

    gsap.to(panelRefs.current.filter(Boolean), {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.07,
      onComplete: () => switchTo(0, true),
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    switchTo(index);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Montserrat:wght@200;300;400;500;600&display=swap');

        .hod-panel { will-change: flex-grow, opacity, box-shadow; }

        .hod-cta:hover {
          background: #B8922A !important;
          border-color: #B8922A !important;
          color: #0A0A0A !important;
        }

        @media (max-width: 900px) {
          .hod-panels { height: 400px !important; }
          .hod-panel-name { font-size: 18px !important; }
          .hod-icon { min-width: 40px !important; max-width: 40px !important; height: 40px !important; }
        }

        @media (max-width: 600px) {
          .hod-panels { flex-direction: column !important; height: auto !important; }
          .hod-panel {
            min-height: 70px;
            min-width: auto !important;
            border-left: none !important;
            border-right: none !important;
            border-top: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.08) !important;
          }
          .hod-gem { display: none !important; }
          .hod-cta { top: 14px !important; right: 14px !important; padding: 9px 16px !important; font-size: 8px !important; }
        }
      `}</style>

      <section
        className="py-[120px] px-[52px] max-w-[1400px] mx-auto max-lg:px-7 max-md:px-5 max-md:py-[70px]"
        style={{ fontFamily: "'Montserrat', -apple-system, sans-serif", fontWeight: 300 }}
      >
        {/* ── Header ── */}
        <div className="text-center mb-14">
          <div
            className="text-[10px] font-medium tracking-[0.32em] uppercase mb-[14px] inline-flex items-center gap-3"
            style={{ color: '#B8922A' }}
          >
            <span className="w-6 h-px" style={{ background: '#B8922A', display: 'inline-block' }} />
            Explore
            <span className="w-6 h-px" style={{ background: '#B8922A', display: 'inline-block' }} />
          </div>

          <h2
            className="font-light leading-[1.05] mb-[14px]"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(40px,5vw,64px)',
              color: '#111',
            }}
          >
            Our <em style={{ fontStyle: 'italic', color: '#B8922A' }}>Collections</em>
          </h2>

          <p
            className="text-[12px] font-light tracking-[0.12em] leading-[1.9] max-w-[580px] mx-auto"
            style={{ color: '#777' }}
          >
            Click to explore each collection — from timeless fine jewellery to bold statement hip hop pieces.
          </p>
        </div>

        {/* ── Panels ── */}
        <div
          className="hod-panels flex w-full overflow-hidden relative"
          style={{ height: '480px' }}
        >
          {PANELS.map((panel) => (
            <div
              key={panel.index}
              ref={(el) => { panelRefs.current[panel.index] = el; }}
              className="hod-panel relative overflow-hidden cursor-pointer flex flex-col justify-end"
              style={{
                minWidth: '70px',
                background: panel.bg,
                border: '2px solid #1a1a1a',
                flexGrow: 1,
              }}
              onClick={() => handleClick(panel.index)}
            >
              {/* Gem */}
              <div
                ref={(el) => { gemRefs.current[panel.index] = el; }}
                className="hod-gem absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-55%)',
                  opacity: 0.7,
                  filter: 'drop-shadow(0 8px 24px rgba(184,146,42,0.2))',
                }}
              >
                {panel.gem}
              </div>

              {/* Bottom shadow vignette */}
              <div
                className="absolute left-0 right-0 bottom-0 pointer-events-none"
                style={{
                  height: '180px',
                  boxShadow: `inset 0 -140px 100px -80px ${panel.shadowColor}`,
                }}
              />

              {/* CTA */}
              <Link
                ref={(el) => { ctaRefs.current[panel.index] = el; }}
                href={panel.ctaHref}
                className="hod-cta absolute z-10 text-white no-underline transition-[background,border-color,color] duration-300"
                style={{
                  top: '28px',
                  right: '28px',
                  padding: '12px 24px',
                  fontSize: '9px',
                  fontWeight: 500,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)',
                  fontFamily: "'Montserrat',sans-serif",
                  opacity: 0,
                  display: 'inline-block',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {panel.cta}
              </Link>

              {/* Label row */}
              <div
                className="absolute left-0 right-0 z-[5] pointer-events-none flex items-center justify-start gap-4"
                style={{ bottom: '24px', padding: '0 24px' }}
              >
                {/* Icon ring */}
                <div
                  ref={(el) => { iconRefs.current[panel.index] = el; }}
                  className="hod-icon flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    minWidth: '48px',
                    maxWidth: '48px',
                    height: '48px',
                    background: 'rgba(20,20,20,0.85)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid #444',
                  }}
                >
                  {panel.icon}
                </div>

                {/* Text */}
                <div>
                  <div
                    ref={(el) => { nameRefs.current[panel.index] = el; }}
                    className="hod-panel-name whitespace-nowrap"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '22px',
                      fontWeight: 400,
                      color: '#fff',
                      letterSpacing: '0.02em',
                      opacity: 0,
                    }}
                  >
                    {panel.name}
                  </div>
                  <div
                    ref={(el) => { descRefs.current[panel.index] = el; }}
                    className="whitespace-nowrap mt-0.5"
                    style={{
                      fontFamily: "'Montserrat',sans-serif",
                      fontSize: '12px',
                      fontWeight: 300,
                      color: 'rgba(255,255,255,0.6)',
                      letterSpacing: '0.06em',
                      opacity: 0,
                    }}
                  >
                    {panel.desc}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}