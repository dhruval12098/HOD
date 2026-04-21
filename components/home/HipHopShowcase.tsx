'use client';

export default function HipHopShowcase() {
  return (
    <section className="overflow-hidden relative">
      <div className="grid grid-cols-2 min-h-[700px] max-[1100px]:grid-cols-1 ">

        {/* ── LEFT PANEL ── */}
        <div
          className="bg-[#0A0A0A] px-[80px] py-[100px] flex flex-col justify-center relative overflow-hidden
                     max-[1100px]:px-[52px] max-[1100px]:py-[80px]
                     max-[700px]:px-7 max-[700px]:py-[60px]"
        >
          {/* glow top-right */}
          <div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(184,146,42,0.12), transparent 70%)' }} />
          {/* glow bottom-left */}
          <div className="absolute -bottom-[60px] -left-[60px] w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,168,64,0.08), transparent 70%)' }} />

          {/* Eyebrow */}
          <div className="text-[10px] font-medium tracking-[0.4em] uppercase text-[#B8922A] mb-6 inline-flex items-center gap-[14px]
                          before:content-[''] before:w-7 before:h-px before:bg-[#B8922A]">
            Drip Different
          </div>

          {/* Headline */}
          <h2 className="font-serif font-light leading-none text-white tracking-[-0.01em] mb-7"
            style={{ fontSize: 'clamp(48px, 5.5vw, 76px)' }}>
            Ice That<br />
            Speaks{' '}
            <em className="not-italic text-[#D4A840] inline-block relative
                           after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-px"
              style={{ fontStyle: 'italic', background: 'none' }}>
              <span className="italic" style={{ color: '#D4A840', position: 'relative' }}>
                Louder.
                <span className="absolute bottom-[-4px] left-0 w-full h-px"
                  style={{ background: 'linear-gradient(90deg, #D4A840, transparent)' }} />
              </span>
            </em>
          </h2>

          {/* Description */}
          <p className="text-[14px] font-light leading-[2] text-white/50 tracking-[0.04em] max-w-[480px] mb-10">
            Not your average jeweller. We hand-set{' '}
            <strong className="text-[#E8D898] font-normal">every single stone</strong>{' '}
            — no shortcuts, no plating, no cap. Cuban links that break necks. Grillz that stop
            conversations. Tennis chains that hit different under lights. All{' '}
            <strong className="text-[#E8D898] font-normal">real gold</strong>, all{' '}
            <strong className="text-[#E8D898] font-normal">real diamonds</strong>, all crafted in Surat
            by the same hands that cut for the world&apos;s biggest brands.
          </p>

          {/* Stats */}
          <div className="flex gap-10 mb-11 max-[700px]:gap-6 max-[700px]:flex-wrap">
            <div>
              <div className="font-serif font-numeric text-[42px] font-normal text-[#E8D898] leading-none">12ct+</div>
              <div className="text-[9px] font-normal tracking-[0.28em] text-white/35 uppercase mt-2">Per Cuban Chain</div>
            </div>
            <div>
              <div className="font-serif font-numeric text-[42px] font-normal text-[#E8D898] leading-none">300+</div>
              <div className="text-[9px] font-normal tracking-[0.28em] text-white/35 uppercase mt-2">Stones Per Piece</div>
            </div>
            <div>
              <div className="font-serif font-numeric text-[42px] font-normal text-[#E8D898] leading-none">14K–18K</div>
              <div className="text-[9px] font-normal tracking-[0.28em] text-white/35 uppercase mt-2">Solid Gold Only</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-4 flex-wrap">
            <a
              href="#"
              className="inline-flex items-center gap-[10px] px-[34px] py-4 text-[10px] font-medium tracking-[0.28em] uppercase
                         text-[#0A0A0A] cursor-pointer transition-all duration-[400ms] no-underline border-0
                         hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(184,146,42,0.45)]"
              style={{
                background: 'linear-gradient(135deg, #B8922A, #D4A840)',
                boxShadow: '0 8px 30px rgba(184,146,42,0.3)',
              }}
            >
              Shop Hip Hop
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-[10px] px-[34px] py-4 text-[10px] font-medium tracking-[0.28em] uppercase
                         bg-transparent text-[#E8D898] border border-[rgba(184,146,42,0.3)] cursor-pointer
                         transition-all duration-[400ms] no-underline
                         hover:bg-[rgba(184,146,42,0.1)] hover:border-[#B8922A]"
            >
              Custom Piece →
            </a>
          </div>
        </div>

        {/* ── RIGHT PANEL — 2×2 cards ── */}
        <div className="grid grid-cols-2 grid-rows-2 max-[700px]:grid-cols-1 max-[700px]:grid-rows-none">

          {/* Card 1 — Cuban Link */}
          <div
            className="relative overflow-hidden cursor-pointer flex items-end p-7 transition-all duration-500
                       max-[700px]:min-h-[220px] group"
            style={{ background: 'linear-gradient(135deg, #111, #1a1a1a)' }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(184,146,42,0.08), transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] opacity-90
                            transition-transform duration-700 group-hover:scale-[1.08] group-hover:-rotate-3"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(184,146,42,0.25))' }}>
              <svg width="120" height="120" viewBox="0 0 110 110" fill="none">
                <ellipse cx="55" cy="22" rx="22" ry="8" stroke="#B8922A" strokeWidth="1" fill="rgba(212,168,64,0.15)" />
                <rect x="45" y="20" width="20" height="4" fill="#D4A840" />
                <ellipse cx="55" cy="40" rx="22" ry="8" stroke="#B8922A" strokeWidth="1" fill="rgba(212,168,64,0.15)" />
                <rect x="45" y="38" width="20" height="4" fill="#D4A840" />
                <ellipse cx="55" cy="58" rx="22" ry="8" stroke="#B8922A" strokeWidth="1" fill="rgba(212,168,64,0.15)" />
                <rect x="45" y="56" width="20" height="4" fill="#D4A840" />
                <ellipse cx="55" cy="76" rx="22" ry="8" stroke="#B8922A" strokeWidth="1" fill="rgba(212,168,64,0.15)" />
                <rect x="45" y="74" width="20" height="4" fill="#D4A840" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="text-[8px] font-medium tracking-[0.28em] uppercase text-[#B8922A] mb-1.5">Full Iced</div>
              <div className="font-serif text-[20px] font-normal text-white tracking-[0.02em]">Cuban Link Chain</div>
              <div className="font-serif font-numeric text-[15px] font-normal text-[#D4A840] mt-1">From $6,800</div>
            </div>
          </div>

          {/* Card 2 — Grillz */}
          <div
            className="relative overflow-hidden cursor-pointer flex items-end p-7 transition-all duration-500
                       max-[700px]:min-h-[220px] group"
            style={{ background: 'linear-gradient(135deg, #0d0d0d, #171717)' }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(184,146,42,0.08), transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] opacity-90
                            transition-transform duration-700 group-hover:scale-[1.08] group-hover:-rotate-3"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(184,146,42,0.25))' }}>
              <svg width="100" height="100" viewBox="0 0 110 110" fill="none">
                <path d="M20 40 L90 40 L85 80 L25 80 Z" stroke="#B8922A" strokeWidth="1" fill="rgba(212,168,64,0.2)" />
                <rect x="25" y="45" width="8" height="28" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".4" />
                <rect x="36" y="45" width="8" height="28" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".4" />
                <rect x="47" y="45" width="8" height="28" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".4" />
                <rect x="58" y="45" width="8" height="28" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".4" />
                <rect x="69" y="45" width="8" height="28" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".4" />
                <rect x="80" y="45" width="5" height="28" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".4" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="text-[8px] font-medium tracking-[0.28em] uppercase text-[#B8922A] mb-1.5">Custom Mould</div>
              <div className="font-serif text-[20px] font-normal text-white tracking-[0.02em]">Baguette Grillz</div>
              <div className="font-serif font-numeric text-[15px] font-normal text-[#D4A840] mt-1">From $2,400</div>
            </div>
          </div>

          {/* Card 3 — Tennis Chain */}
          <div
            className="relative overflow-hidden cursor-pointer flex items-end p-7 transition-all duration-500
                       max-[700px]:min-h-[220px] group"
            style={{ background: 'linear-gradient(135deg, #141414, #1e1e1e)' }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(184,146,42,0.08), transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] opacity-90
                            transition-transform duration-700 group-hover:scale-[1.08] group-hover:-rotate-3"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(184,146,42,0.25))' }}>
              <svg width="100" height="100" viewBox="0 0 110 110" fill="none">
                <circle cx="15" cy="55" r="6" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".6" />
                <circle cx="30" cy="55" r="6" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".6" />
                <circle cx="45" cy="55" r="6" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".6" />
                <circle cx="60" cy="55" r="6" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".6" />
                <circle cx="75" cy="55" r="6" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".6" />
                <circle cx="90" cy="55" r="6" fill="rgba(212,168,64,0.35)" stroke="#B8922A" strokeWidth=".6" />
                <path d="M15 55 L90 55" stroke="#B8922A" strokeWidth="0.6" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="font-numeric text-[8px] font-medium tracking-[0.28em] uppercase text-[#B8922A] mb-1.5">4-Prong · 20&quot;</div>
              <div className="font-serif text-[20px] font-normal text-white tracking-[0.02em]">Tennis Chain</div>
              <div className="font-serif font-numeric text-[15px] font-normal text-[#D4A840] mt-1">From $3,600</div>
            </div>
          </div>

          {/* Card 4 — Cross Pendant */}
          <div
            className="relative overflow-hidden cursor-pointer flex items-end p-7 transition-all duration-500
                       max-[700px]:min-h-[220px] group"
            style={{ background: 'linear-gradient(135deg, #0a0a0a, #151515)' }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(184,146,42,0.08), transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] opacity-90
                            transition-transform duration-700 group-hover:scale-[1.08] group-hover:-rotate-3"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(184,146,42,0.25))' }}>
              <svg width="100" height="100" viewBox="0 0 110 110" fill="none">
                <rect x="48" y="20" width="14" height="70" fill="rgba(212,168,64,0.2)" stroke="#B8922A" strokeWidth="1" />
                <rect x="30" y="42" width="50" height="14" fill="rgba(212,168,64,0.2)" stroke="#B8922A" strokeWidth="1" />
                <circle cx="55" cy="26" r="3" fill="#D4A840" opacity=".7" />
                <circle cx="55" cy="42" r="3" fill="#D4A840" opacity=".7" />
                <circle cx="55" cy="58" r="3" fill="#D4A840" opacity=".7" />
                <circle cx="55" cy="74" r="3" fill="#D4A840" opacity=".7" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="font-numeric text-[8px] font-medium tracking-[0.28em] uppercase text-[#B8922A] mb-1.5">Full Iced · 5ct</div>
              <div className="font-serif text-[20px] font-normal text-white tracking-[0.02em]">Cross Pendant</div>
              <div className="font-serif font-numeric text-[15px] font-normal text-[#D4A840] mt-1">From $2,800</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
