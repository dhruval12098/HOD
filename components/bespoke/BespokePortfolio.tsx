'use client';

import { useState, useEffect, useRef } from 'react';

type PortfolioCategory = {
  id: string;
  name: string;
  slug: string;
};

type PortfolioItem = {
  id: string;
  title: string;
  tag: string;
  media_type: 'image' | 'video';
  media_url?: string;
  thumbnail_url?: string;
  gem_style?: string | null;
  gem_color?: string | null;
  dark_theme: boolean;
  short_description?: string | null;
  category: PortfolioCategory;
};

function GemSVG({ style, size = 140, color = '#20304A' }: { style: string; size?: number; color?: string }) {
  const cL = '#0A1628';
  const s = size;

  switch (style) {
    case 'pear':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><path d="M55 15 Q75 38 72 68 Q65 92 55 94 Q45 92 38 68 Q35 38 55 15Z" stroke={cL} strokeWidth="1" fill={`${color}22`} /><path d="M55 25 Q68 42 65 65 Q60 82 55 84 Q50 82 45 65 Q42 42 55 25Z" stroke={cL} strokeWidth=".5" fill={`${color}14`} /><circle cx="48" cy="45" r="3" fill="#fff" opacity=".6" /></svg>;
    case 'oval':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><ellipse cx="55" cy="55" rx="22" ry="32" stroke={cL} strokeWidth="1" fill={`${color}22`} /><ellipse cx="55" cy="55" rx="14" ry="22" stroke={cL} strokeWidth=".5" fill={`${color}14`} /><circle cx="50" cy="42" r="4" fill="#fff" opacity=".6" /></svg>;
    case 'emerald':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><rect x="32" y="25" width="46" height="60" stroke={cL} strokeWidth="1" fill={`${color}22`} /><rect x="38" y="33" width="34" height="44" stroke={cL} strokeWidth=".5" fill={`${color}14`} /><rect x="44" y="41" width="22" height="28" stroke={cL} strokeWidth=".3" fill="none" /></svg>;
    case 'trilogy':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><polygon points="55,18 73,30 68,90 42,90 37,30" stroke={cL} strokeWidth="1" fill={`${color}33`} /><polygon points="28,40 38,48 33,80 18,80 13,48" stroke={cL} strokeWidth="0.8" fill="#20304A33" /><polygon points="82,40 92,48 87,80 72,80 67,48" stroke={cL} strokeWidth="0.8" fill="#20304A33" /></svg>;
    case 'row':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><rect x="12" y="45" width="86" height="20" rx="10" stroke={cL} strokeWidth="1" fill={`${color}22`} />{[22, 38, 55, 72, 88].map((cx) => <circle key={cx} cx={cx} cy="55" r="5" fill={`${color}55`} stroke={cL} strokeWidth=".5" />)}</svg>;
    case 'eternity':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><circle cx="55" cy="55" r="32" stroke={cL} strokeWidth="1" fill="none" /><circle cx="55" cy="55" r="26" stroke={cL} strokeWidth="0.5" fill="none" opacity=".4" />{Array.from({ length: 10 }).map((_, i) => { const a = (i / 10) * Math.PI * 2; const x = 55 + Math.cos(a) * 29; const y = 55 + Math.sin(a) * 29; return <circle key={i} cx={parseFloat(x.toFixed(1))} cy={parseFloat(y.toFixed(1))} r="3.4" fill={`${color}66`} stroke={cL} strokeWidth=".4" />; })}</svg>;
    case 'chain':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none">{[22, 40, 58, 76].map((cy) => <g key={cy}><ellipse cx="55" cy={cy} rx="22" ry="8" stroke={cL} strokeWidth="1" fill={`${color}22`} /><rect x="45" y={cy - 2} width="20" height="4" fill={color} /></g>)}</svg>;
    case 'cross':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><rect x="48" y="20" width="14" height="70" fill={`${color}33`} stroke={cL} strokeWidth="1" /><rect x="30" y="42" width="50" height="14" fill={`${color}33`} stroke={cL} strokeWidth="1" />{[26, 42, 58, 74].map((y) => <circle key={y} cx="55" cy={y} r="3" fill={color} opacity=".7" />)}</svg>;
    default:
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><polygon points="55,15 85,35 77,85 33,85 25,35" stroke={cL} strokeWidth="1" fill={`${color}22`} /><polygon points="55,25 75,40 69,75 41,75 35,40" stroke={cL} strokeWidth=".5" fill={`${color}14`} /><line x1="55" y1="15" x2="33" y2="85" stroke={cL} strokeWidth=".4" opacity=".5" /><line x1="55" y1="15" x2="77" y2="85" stroke={cL} strokeWidth=".4" opacity=".5" /><line x1="25" y1="35" x2="85" y2="35" stroke={cL} strokeWidth=".4" opacity=".5" /><circle cx="48" cy="35" r="3" fill="#fff" opacity=".7" /></svg>;
  }
}

function VideoModal({ item, onClose }: { item: PortfolioItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    document.body.classList.add('overflow-hidden');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', onKey);
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.95)] z-[10003] flex items-center justify-center p-10 animate-[fadeUp_0.3s_ease]" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-[900px] aspect-video bg-black border border-[rgba(10,22,40,0.3)]">
        <button onClick={onClose} aria-label="Close" className="absolute -top-11 right-0 bg-transparent border-none cursor-pointer text-white text-[14px] tracking-[0.24em] uppercase flex items-center gap-2.5 font-sans font-light hover:text-[#0A1628] transition-colors duration-300">
          Close
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor">
            <path d="M1 1L13 13M13 1L1 13" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="w-full h-full flex flex-col items-center justify-center text-[#FFFFFF] text-center p-10">
          {item.media_type === 'video' ? (
            item.media_url ? (
              <video src={item.media_url} className="h-full w-full object-contain" controls autoPlay playsInline />
            ) : (
              <>
                <div className="w-20 h-20 mb-5 border-2 border-[#0A1628] rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 ml-1.5" style={{ borderLeft: '22px solid #0A1628', borderTop: '14px solid transparent', borderBottom: '14px solid transparent' }} />
                </div>
                <div className="font-serif text-[28px] tracking-[0.04em] mb-2.5">{item.title}</div>
                <p className="text-[11px] text-[#6A6A6A] tracking-[0.14em] leading-[1.8] max-w-[440px]">
                  {item.short_description || 'Bespoke video showcase.'}
                </p>
              </>
            )
          ) : (
            <>
              {item.media_url ? (
                <img src={item.media_url} alt={item.title} className="max-h-[70vh] w-auto max-w-full object-contain" />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  <GemSVG style={item.gem_style ?? 'round'} size={180} color={item.gem_color ?? '#20304A'} />
                </div>
              )}
              <div className="font-serif text-[28px] tracking-[0.04em] mt-5 mb-2.5">{item.title}</div>
              <p className="text-[11px] text-[#6A6A6A] tracking-[0.14em] leading-[1.8] max-w-[440px]">
                {item.short_description || 'A bespoke creation from the House of Diams atelier.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RevealDiv({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          entries[0].target.classList.add('opacity-100', 'translate-y-0');
          entries[0].target.classList.remove('opacity-0', 'translate-y-6');
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px' }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-6 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function BespokePortfolio() {
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch('/api/public/bespoke/portfolio', { cache: 'no-store' });
        const payload = await response.json();
        if (!active) return;
        setCategories(Array.isArray(payload?.categories) ? payload.categories : []);
        setItems(Array.isArray(payload?.items) ? payload.items : []);
      } catch {
        if (!active) return;
        setCategories([]);
        setItems([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filters = [
    { key: 'all', label: 'All' },
    ...categories.filter((category) => category.slug !== 'all').map((category) => ({ key: category.slug, label: category.name })),
  ];

  const filtered = activeFilter === 'all' ? items : items.filter((item) => item.category?.slug === activeFilter);

  if (!items.length && !categories.length) return null;

  return (
    <>
      <section className="py-[90px] px-[52px] max-w-[1400px] mx-auto max-lg:px-7 max-md:px-5 max-md:py-[60px]">
        <div className="text-center mb-8">
          <RevealDiv className="flex justify-center">
            <div className="text-[10px] font-normal tracking-[0.32em] text-[#0A1628] uppercase mb-[18px] inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#0A1628]">
              Past Creations
            </div>
          </RevealDiv>
          <RevealDiv delay={100}>
            <h2 className="font-serif font-light tracking-[0.02em] text-[#0A1628] leading-[1.05] mb-[18px]" style={{ fontSize: 'clamp(40px, 5.5vw, 72px)' }}>
              Bespoke <em className="not-italic text-[#0A1628] font-normal">Portfolio</em>
            </h2>
          </RevealDiv>
          <RevealDiv delay={200}>
            <p className="text-[12px] font-light tracking-[0.12em] text-[#6A6A6A] leading-[1.9] max-w-[560px] mx-auto mt-4">
              A selection of pieces we&apos;ve crafted for clients across 40+ countries. Click any piece to view the story and craftsmanship video.
            </p>
          </RevealDiv>
        </div>

        <RevealDiv className="flex gap-2.5 justify-center flex-wrap mb-12">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-[22px] py-2.5 text-[10px] font-normal tracking-[0.24em] uppercase border cursor-pointer transition-all duration-300 ${
                activeFilter === filter.key
                  ? 'bg-[#0A1628] text-[#FAFBFD] border-[#0A1628]'
                  : 'bg-transparent text-[#6A6A6A] border-[rgba(10,22,40,0.10)] hover:text-[#0A1628] hover:border-[#253246]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </RevealDiv>

        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
          {filtered.map((item, i) => (
            <RevealDiv key={item.id} delay={i * 60}>
              <div
                onClick={() => setActiveItem(item)}
                className="relative cursor-pointer border border-[rgba(10,22,40,0.10)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(10,22,40,0.12)] hover:border-[rgba(10,22,40,0.25)] group"
                style={{ aspectRatio: '4/5' }}
              >
                <div
                  className={`absolute inset-0 flex items-center justify-center ${item.dark_theme ? 'bg-gradient-to-br from-[#0A1628] to-[#111F34]' : 'bg-gradient-to-br from-[#FAF7F2] to-[#F5F7FC]'}`}
                  style={{
                    background: item.dark_theme ? undefined : 'radial-gradient(circle at 50% 40%, rgba(10,22,40,0.12), transparent 70%)',
                  }}
                >
                  {item.thumbnail_url || (item.media_type === 'image' && item.media_url) ? (
                    <img src={item.thumbnail_url || item.media_url} alt={item.title} className="h-full w-full object-cover" />
                  ) : item.media_type === 'video' && item.media_url ? (
                    <video src={item.media_url} className="h-full w-full object-cover" muted autoPlay loop playsInline />
                  ) : (
                    <GemSVG style={item.gem_style ?? 'round'} size={140} color={item.gem_color ?? '#20304A'} />
                  )}
                </div>

                {item.media_type === 'video' && (
                  <>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[58px] h-[58px] rounded-full bg-[rgba(255,255,255,0.95)] shadow-[0_8px_24px_rgba(10,22,40,0.2)] z-[2] transition-transform duration-300 group-hover:scale-110" />
                    <div
                      className="absolute top-1/2 left-1/2 z-[3] pointer-events-none"
                      style={{
                        transform: 'translate(-35%, -50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '16px solid #0A1628',
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                      }}
                    />
                  </>
                )}

                <div className="absolute top-3.5 left-3.5 text-[8px] font-medium tracking-[0.26em] uppercase bg-[rgba(255,255,255,0.95)] backdrop-blur-[10px] text-[#0A1628] border border-[rgba(10,22,40,0.25)] px-3 py-[5px] z-[4]">
                  {item.tag}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-[22px] z-[4] transition-all duration-400 translate-y-[30%] opacity-70 group-hover:translate-y-0 group-hover:opacity-100" style={{ background: 'linear-gradient(0deg, rgba(10,22,40,0.85), transparent)' }}>
                  <div className="font-serif text-[20px] font-normal text-white tracking-[0.02em] mb-1">
                    {item.title}
                  </div>
                  <div className="text-[9px] tracking-[0.3em] uppercase text-[#FFFFFF]">
                    {item.media_type === 'video' ? 'Watch Video · ' : ''}View Details
                  </div>
                </div>
              </div>
            </RevealDiv>
          ))}
        </div>

        <RevealDiv className="text-center mt-12">
          <p className="text-[12px] text-[#6A6A6A] tracking-[0.06em] leading-[1.9] max-w-[520px] mx-auto">
            Have a piece in mind? Every creation begins with a conversation. Share your vision below and we&apos;ll bring it to life.
          </p>
        </RevealDiv>
      </section>

      <VideoModal item={activeItem} onClose={() => setActiveItem(null)} />
    </>
  );
}
