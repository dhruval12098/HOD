'use client';

import { useState, useEffect, useRef } from 'react';

// ── Portfolio Data ─────────────────────────────────────────────────────────────
const PORTFOLIO_ITEMS = [
  { id: 1,  title: 'Halo Solitaire',        tag: 'Ring',     category: 'rings',      isVideo: true,  gem: 'round',   gemColor: '#D4A840', dark: false },
  { id: 2,  title: 'Teardrop Pendant',       tag: 'Necklace', category: 'necklaces',  isVideo: false, gem: 'pear',    gemColor: '#D4A840', dark: false },
  { id: 3,  title: 'Tennis Bracelet',        tag: 'Bracelet', category: 'bracelets',  isVideo: true,  gem: 'row',     gemColor: '#D4A840', dark: false },
  { id: 4,  title: 'Fancy Yellow Trilogy',   tag: 'Ring',     category: 'rings',      isVideo: false, gem: 'trilogy', gemColor: '#E8C84A', dark: false },
  { id: 5,  title: 'Iced Cuban Chain',       tag: 'Chain',    category: 'hiphop',     isVideo: true,  gem: 'chain',   gemColor: '#D4A840', dark: true  },
  { id: 6,  title: 'Oval Halo Earrings',     tag: 'Earrings', category: 'earrings',   isVideo: false, gem: 'oval',    gemColor: '#D4A840', dark: false },
  { id: 7,  title: 'Emerald Cut Solitaire',  tag: 'Ring',     category: 'rings',      isVideo: true,  gem: 'emerald', gemColor: '#D4A840', dark: false },
  { id: 8,  title: 'Eternity Band',          tag: 'Ring',     category: 'rings',      isVideo: false, gem: 'eternity',gemColor: '#D4A840', dark: false },
  { id: 9,  title: 'Cross Pendant',          tag: 'Pendant',  category: 'hiphop',     isVideo: true,  gem: 'cross',   gemColor: '#D4A840', dark: true  },
];

const FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'rings',     label: 'Rings' },
  { key: 'necklaces', label: 'Necklaces' },
  { key: 'bracelets', label: 'Bracelets' },
  { key: 'earrings',  label: 'Earrings' },
  { key: 'hiphop',    label: 'Hip Hop' },
];

// ── Gem SVG ────────────────────────────────────────────────────────────────────
function GemSVG({ style, size = 140, color = '#D4A840' }: { style: string; size?: number; color?: string }) {
  const cL = '#B8922A';
  const s = size;

  switch (style) {
    case 'pear':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><path d="M55 15 Q75 38 72 68 Q65 92 55 94 Q45 92 38 68 Q35 38 55 15Z" stroke={cL} strokeWidth="1" fill={`${color}22`}/><path d="M55 25 Q68 42 65 65 Q60 82 55 84 Q50 82 45 65 Q42 42 55 25Z" stroke={cL} strokeWidth=".5" fill={`${color}14`}/><circle cx="48" cy="45" r="3" fill="#fff" opacity=".6"/></svg>;
    case 'oval':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><ellipse cx="55" cy="55" rx="22" ry="32" stroke={cL} strokeWidth="1" fill={`${color}22`}/><ellipse cx="55" cy="55" rx="14" ry="22" stroke={cL} strokeWidth=".5" fill={`${color}14`}/><circle cx="50" cy="42" r="4" fill="#fff" opacity=".6"/></svg>;
    case 'emerald':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><rect x="32" y="25" width="46" height="60" stroke={cL} strokeWidth="1" fill={`${color}22`}/><rect x="38" y="33" width="34" height="44" stroke={cL} strokeWidth=".5" fill={`${color}14`}/><rect x="44" y="41" width="22" height="28" stroke={cL} strokeWidth=".3" fill="none"/></svg>;
    case 'trilogy':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><polygon points="55,18 73,30 68,90 42,90 37,30" stroke={cL} strokeWidth="1" fill={`${color}33`}/><polygon points="28,40 38,48 33,80 18,80 13,48" stroke={cL} strokeWidth="0.8" fill="#D4A84033"/><polygon points="82,40 92,48 87,80 72,80 67,48" stroke={cL} strokeWidth="0.8" fill="#D4A84033"/></svg>;
    case 'row':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><rect x="12" y="45" width="86" height="20" rx="10" stroke={cL} strokeWidth="1" fill={`${color}22`}/>{[22,38,55,72,88].map(cx=><circle key={cx} cx={cx} cy="55" r="5" fill={`${color}55`} stroke={cL} strokeWidth=".5"/>)}</svg>;
    case 'eternity':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><circle cx="55" cy="55" r="32" stroke={cL} strokeWidth="1" fill="none"/><circle cx="55" cy="55" r="26" stroke={cL} strokeWidth="0.5" fill="none" opacity=".4"/>{Array.from({length:10}).map((_,i)=>{const a=(i/10)*Math.PI*2;const x=55+Math.cos(a)*29;const y=55+Math.sin(a)*29;return<circle key={i} cx={parseFloat(x.toFixed(1))} cy={parseFloat(y.toFixed(1))} r="3.4" fill={`${color}66`} stroke={cL} strokeWidth=".4"/>})}</svg>;
    case 'chain':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none">{[22,40,58,76].map(cy=><g key={cy}><ellipse cx="55" cy={cy} rx="22" ry="8" stroke={cL} strokeWidth="1" fill={`${color}22`}/><rect x="45" y={cy-2} width="20" height="4" fill={color}/></g>)}</svg>;
    case 'cross':
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><rect x="48" y="20" width="14" height="70" fill={`${color}33`} stroke={cL} strokeWidth="1"/><rect x="30" y="42" width="50" height="14" fill={`${color}33`} stroke={cL} strokeWidth="1"/>{[26,42,58,74].map(y=><circle key={y} cx="55" cy={y} r="3" fill={color} opacity=".7"/>)}</svg>;
    default: // round
      return <svg width={s} height={s} viewBox="0 0 110 110" fill="none"><polygon points="55,15 85,35 77,85 33,85 25,35" stroke={cL} strokeWidth="1" fill={`${color}22`}/><polygon points="55,25 75,40 69,75 41,75 35,40" stroke={cL} strokeWidth=".5" fill={`${color}14`}/><line x1="55" y1="15" x2="33" y2="85" stroke={cL} strokeWidth=".4" opacity=".5"/><line x1="55" y1="15" x2="77" y2="85" stroke={cL} strokeWidth=".4" opacity=".5"/><line x1="25" y1="35" x2="85" y2="35" stroke={cL} strokeWidth=".4" opacity=".5"/><circle cx="48" cy="35" r="3" fill="#fff" opacity=".7"/></svg>;
  }
}

// ── Video Modal ────────────────────────────────────────────────────────────────
function VideoModal({
  item,
  onClose,
}: {
  item: typeof PORTFOLIO_ITEMS[0] | null;
  onClose: () => void;
}) {
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
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.95)] z-[10003] flex items-center justify-center p-10 animate-[fadeUp_0.3s_ease]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-[900px] aspect-video bg-black border border-[rgba(184,146,42,0.3)]">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-11 right-0 bg-transparent border-none cursor-pointer text-white text-[14px] tracking-[0.24em] uppercase flex items-center gap-2.5 font-sans font-light hover:text-[#B8922A] transition-colors duration-300"
        >
          Close
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor">
            <path d="M1 1L13 13M13 1L1 13" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Content — replace with real video/images when ready */}
        <div className="w-full h-full flex flex-col items-center justify-center text-[#E8D898] text-center p-10">
          {item.isVideo ? (
            <>
              {/* Play circle */}
              <div className="w-20 h-20 mb-5 border-2 border-[#B8922A] rounded-full flex items-center justify-center">
                <div
                  className="w-0 h-0 ml-1.5"
                  style={{
                    borderLeft: '22px solid #B8922A',
                    borderTop: '14px solid transparent',
                    borderBottom: '14px solid transparent',
                  }}
                />
              </div>
              <div className="font-serif text-[28px] tracking-[0.04em] mb-2.5">{item.title}</div>
              <p className="text-[11px] text-[#8A7E5C] tracking-[0.14em] leading-[1.8] max-w-[440px]">
                Video placeholder · Replace with your own footage.
                <br />
                Embed your YouTube / Vimeo URL or upload MP4 files here.
              </p>
            </>
          ) : (
            <>
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <GemSVG style={item.gem} size={180} color={item.gemColor} />
              </div>
              <div className="font-serif text-[28px] tracking-[0.04em] mt-5 mb-2.5">{item.title}</div>
              <p className="text-[11px] text-[#8A7E5C] tracking-[0.14em] leading-[1.8] max-w-[440px]">
                Photography placeholder · Replace with your own image gallery when ready.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reveal ─────────────────────────────────────────────────────────────────────
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
      entries => {
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

// ── Main Component ─────────────────────────────────────────────────────────────
export default function BespokePortfolio() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeItem, setActiveItem] = useState<typeof PORTFOLIO_ITEMS[0] | null>(null);

  const filtered =
    activeFilter === 'all'
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter(p => p.category === activeFilter);

  return (
    <>
      <section className="py-[90px] px-[52px] max-w-[1400px] mx-auto max-lg:px-7 max-md:px-5 max-md:py-[60px]">
        {/* Header */}
        <div className="text-center mb-8">
          <RevealDiv className="flex justify-center">
            <div className="text-[10px] font-normal tracking-[0.32em] text-[#B8922A] uppercase mb-[18px] inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
              Past Creations
            </div>
          </RevealDiv>
          <RevealDiv delay={100}>
            <h2
              className="font-serif font-light tracking-[0.02em] text-[#14120D] leading-[1.05] mb-[18px]"
              style={{ fontSize: 'clamp(40px, 5.5vw, 72px)' }}
            >
              Bespoke <em className="not-italic text-[#B8922A] font-normal">Portfolio</em>
            </h2>
          </RevealDiv>
          <RevealDiv delay={200}>
            <p className="text-[12px] font-light tracking-[0.12em] text-[#7A7060] leading-[1.9] max-w-[560px] mx-auto mt-4">
              A selection of pieces we've crafted for clients across 40+ countries. Click any piece
              to view the story and craftsmanship video.
            </p>
          </RevealDiv>
        </div>

        {/* Filter buttons */}
        <RevealDiv className="flex gap-2.5 justify-center flex-wrap mb-12">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-[22px] py-2.5 text-[10px] font-normal tracking-[0.24em] uppercase border cursor-pointer transition-all duration-300 ${
                activeFilter === f.key
                  ? 'bg-[#14120D] text-[#FBF9F5] border-[#14120D]'
                  : 'bg-transparent text-[#7A7060] border-[rgba(20,18,13,0.10)] hover:text-[#14120D] hover:border-[#3A3628]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </RevealDiv>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
          {filtered.map((item, i) => (
            <RevealDiv key={item.id} delay={i * 60}>
              <div
                onClick={() => setActiveItem(item)}
                className="relative cursor-pointer border border-[rgba(20,18,13,0.10)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(20,18,13,0.12)] hover:border-[rgba(184,146,42,0.25)] group"
                style={{ aspectRatio: '4/5' }}
              >
                {/* Visual background */}
                <div
                  className={`absolute inset-0 flex items-center justify-center ${
                    item.dark
                      ? 'bg-gradient-to-br from-[#14120D] to-[#1C1A14]'
                      : 'bg-gradient-to-br from-[#F6F2EA] to-[#EEE7DA]'
                  }`}
                  style={{
                    background: item.dark
                      ? undefined
                      : 'radial-gradient(circle at 50% 40%, rgba(184,146,42,0.12), transparent 70%)',
                  }}
                >
                  <GemSVG style={item.gem} size={140} color={item.gemColor} />
                </div>

                {/* Video play button */}
                {item.isVideo && (
                  <>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[58px] h-[58px] rounded-full bg-[rgba(255,255,255,0.95)] shadow-[0_8px_24px_rgba(20,18,13,0.2)] z-[2] transition-transform duration-300 group-hover:scale-110" />
                    <div
                      className="absolute top-1/2 left-1/2 z-[3] pointer-events-none"
                      style={{
                        transform: 'translate(-35%, -50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '16px solid #B8922A',
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                      }}
                    />
                  </>
                )}

                {/* Tag badge */}
                <div className="absolute top-3.5 left-3.5 text-[8px] font-medium tracking-[0.26em] uppercase bg-[rgba(255,255,255,0.95)] backdrop-blur-[10px] text-[#8A6A10] border border-[rgba(184,146,42,0.25)] px-3 py-[5px] z-[4]">
                  {item.tag}
                </div>

                {/* Hover overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-[22px] z-[4] transition-all duration-400 translate-y-[30%] opacity-70 group-hover:translate-y-0 group-hover:opacity-100"
                  style={{ background: 'linear-gradient(0deg, rgba(20,18,13,0.85), transparent)' }}
                >
                  <div className="font-serif text-[20px] font-normal text-white tracking-[0.02em] mb-1">
                    {item.title}
                  </div>
                  <div className="text-[9px] tracking-[0.3em] uppercase text-[#E8D898]">
                    {item.isVideo ? 'Watch Video · ' : ''}View Details
                  </div>
                </div>
              </div>
            </RevealDiv>
          ))}
        </div>

        {/* Footer note */}
        <RevealDiv className="text-center mt-12">
          <p className="text-[12px] text-[#7A7060] tracking-[0.06em] leading-[1.9] max-w-[520px] mx-auto">
            Have a piece in mind? Every creation begins with a conversation. Share your vision below
            and we'll bring it to life.
          </p>
        </RevealDiv>
      </section>

      {/* Video / Photo Modal */}
      <VideoModal item={activeItem} onClose={() => setActiveItem(null)} />
    </>
  );
}
