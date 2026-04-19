'use client';

import { useEffect, useRef, useState } from 'react';



const REEL_ITEMS = [
  { label: 'New Arrival', video: 'https://videos.pexels.com/video-files/8844339/8844339-sd_360_640_30fps.mp4' },
  { label: 'Bespoke Order', video: 'https://videos.pexels.com/video-files/31757664/13529798_360_450_30fps.mp4' },
  { label: 'Studio Visit', video: 'https://videos.pexels.com/video-files/8844354/8844354-hd_1080_1920_30fps.mp4' },
  { label: 'Behind the Craft', video: 'https://videos.pexels.com/video-files/8715506/8715506-sd_506_960_25fps.mp4' },
  { label: 'Client Story', video: 'https://videos.pexels.com/video-files/8855209/8855209-sd_360_640_30fps.mp4' },
  { label: 'Collection Launch', video: 'https://videos.pexels.com/video-files/31992241/13633876_360_450_30fps.mp4' },
  { label: 'Fancy Yellow', video: 'https://videos.pexels.com/video-files/7308235/7308235-sd_360_640_24fps.mp4' },
  { label: 'Hip Hop Drop', video: 'https://videos.pexels.com/video-files/8844353/8844353-sd_240_426_30fps.mp4' },
];

const STATS = [
  { count: 12, suffix: 'K+', label: 'Followers' },
  { count: 80, suffix: '+', label: 'Posts & Reels' },
  { count: 5, suffix: 'M+', label: 'Reel Views' },
];

function useCountUp(target: number, suffix: string, active: boolean) {
  const [display, setDisplay] = useState('0' + suffix);
  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const start = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.floor(target * easeOut(progress)) + suffix);
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(target + suffix);
    };
    requestAnimationFrame(tick);
  }, [active, target, suffix]);
  return display;
}

function StatItem({ count, suffix, label, active }: { count: number; suffix: string; label: string; active: boolean }) {
  const display = useCountUp(count, suffix, active);
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'var(--numeric)',
          fontSize: '40px',
          fontWeight: 400,
          color: 'var(--gold)',
          lineHeight: 1,
        }}
      >
        {display}
      </div>
      <div
        style={{
          fontSize: '9px',
          fontWeight: 400,
          letterSpacing: '0.28em',
          color: 'var(--ink3)',
          textTransform: 'uppercase',
          marginTop: '8px',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function InstagramReels() {
  const footerRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setStatsVisible(true); }),
      { threshold: 0.3 }
    );
    if (footerRef.current) obs.observe(footerRef.current);
    return () => obs.disconnect();
  }, []);

  const allReels = [...REEL_ITEMS, ...REEL_ITEMS];

  return (
    <section
      className="py-[110px] max-w-[1400px] mx-auto"
      style={{ fontFamily: 'var(--sans)' }}
    >
      {/* Header */}
      <div
        className="reveal px-[52px] flex justify-between items-end mb-[48px] flex-wrap gap-5"
      >
        <div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 400,
              letterSpacing: '0.32em',
              color: 'var(--gold)',
              textTransform: 'uppercase',
              marginBottom: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ width: '24px', height: '1px', background: 'var(--gold)', display: 'inline-block' }} />
            @houseofdiams
          </div>
          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(40px, 5.5vw, 72px)',
              fontWeight: 300,
              letterSpacing: '0.02em',
              color: 'var(--ink)',
              lineHeight: 1.05,
              marginBottom: 0,
            }}
          >
            Follow the <em style={{ fontStyle: 'normal', color: 'var(--gold)', fontWeight: 400 }}>Craft</em>
          </h2>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 300,
              letterSpacing: '0.1em',
              color: 'var(--ink3)',
              marginTop: '10px',
            }}
          >
            New drops, behind-the-scenes and custom reveals
          </p>
        </div>

        <a
          href="https://instagram.com/houseofdiams"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '13px 26px',
            border: '1px solid var(--ink)',
            fontSize: '10px',
            fontWeight: 400,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            textDecoration: 'none',
            transition: 'all 0.4s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'var(--ink)';
            el.style.color = 'var(--bg)';
            el.style.gap = '14px';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'transparent';
            el.style.color = 'var(--ink)';
            el.style.gap = '10px';
          }}
        >
          Follow on Instagram
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6H10M7 3L10 6L7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      {/* Reel marquee */}
      <div
        style={{
          padding: '20px 0',
          overflow: 'hidden',
          position: 'relative',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 5%, black 95%, transparent)',
          maskImage: 'linear-gradient(90deg, transparent, black 5%, black 95%, transparent)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '18px',
            animation: 'marquee 40s linear infinite',
            width: 'max-content',
          }}
        >
          {allReels.map((r, i) => (
            <div
              key={`reel-${i}-${r.label}`}
              onClick={() => window.open('https://instagram.com/houseofdiams', '_blank')}
              style={{
                width: '220px',
                height: '340px',
                flexShrink: 0,
                background: 'linear-gradient(135deg, var(--bg2), var(--bg3))',
                border: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.4s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-6px)';
                el.style.boxShadow = 'var(--shadow-lg)';
                el.style.borderColor = 'var(--border-gold)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
                el.style.borderColor = 'var(--border)';
              }}
            >
              {/* Video Background */}
              <video
                src={r.video}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.85,
                }}
              />
              {/* Overlay Gradient */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, transparent 40%, rgba(20,18,13,0.7) 100%)',
                }}
              />
              {/* Play Icon */}
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polygon points="3,2 10,6 3,10" fill="#fff" />
                </svg>
              </div>
              {/* Label */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '18px',
                  left: '18px',
                  fontSize: '10px',
                  fontWeight: 400,
                  letterSpacing: '0.14em',
                  color: 'var(--ink)',
                  textTransform: 'uppercase',
                  lineHeight: 1.5,
                }}
              >
                @houseofdiams<br />{r.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div
        ref={footerRef}
        className="reveal"
        style={{
          marginTop: '52px',
          padding: '40px 52px',
          display: 'flex',
          gap: '60px',
          justifyContent: 'center',
          alignItems: 'center',
          borderTop: '1px solid var(--border)',
        }}
      >
        {STATS.map((s, i) => (
          <div key={`stat-${i}`}>
            <StatItem count={s.count} suffix={s.suffix} label={s.label} active={statsVisible} />
            {i < STATS.length - 1 && (
              <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
