'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

// ── Nav structure ──────────────────────────────────────────────────
const METAL_COLORS: Record<string, string> = {
  yellow:   'linear-gradient(135deg,#F5D76E,#D4A840)',
  rose:     'linear-gradient(135deg,#F0C4B0,#D4967A)',
  white:    'linear-gradient(135deg,#F0F0F0,#D8D8D8)',
  platinum: 'linear-gradient(135deg,#E8E8E8,#C0C0C0)',
};

function MetalDot({ type }: { type: keyof typeof METAL_COLORS }) {
  return (
    <span
      className="inline-block w-5 h-5 rounded-full border border-black/10 flex-shrink-0"
      style={{ background: METAL_COLORS[type] }}
    />
  );
}

// ── Mega-menu data ─────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: 'Fine Jewellery',
    mega: {
      cols: 4,
      sections: [
        { title: 'Rings',     links: ['Wedding Bands', 'Eternity Rings'] },
        { title: 'Earrings',  links: ['Diamond Earrings', 'Drop & Dangle', 'Huggies & Hoops'] },
        { title: 'Necklaces', links: ['Diamond Pendants', 'Necklaces'] },
        { title: 'Bracelets', links: ['Tennis', 'Bangles'] },
      ],
    },
  },
  {
    label: 'Engagement Rings',
    mega: {
      cols: 3,
      sections: [
        {
          title: 'Shop by Shape',
          twoCol: true,
          links: ['Round', 'Oval', 'Cushion', 'Pear', 'Emerald', 'Princess'],
        },
        {
          title: 'Shop by Style',
          twoCol: true,
          links: ['Solitaire', 'Nature', 'Vintage', 'Side Stone', 'Hidden Halo', 'Pavé', 'Three Stone', 'Halo', 'Bezel'],
        },
        {
          title: 'Shop by Metal',
          metals: ['yellow', 'rose', 'white', 'platinum'] as const,
          metalLabels: ['Yellow Gold', 'Rose Gold', 'White Gold', 'Platinum'],
        },
      ],
    },
  },
  {
    label: 'Wedding Bands',
    mega: {
      cols: 3,
      sections: [
        { title: 'For Her', links: ['Nature', 'Solid', 'Pavé', 'Eternity', 'Anniversary', 'Prong'] },
        { title: 'For Him', links: ['Classic', 'Diamonds', 'Designer'] },
        {
          title: 'Shop by Metal',
          metals: ['yellow', 'rose', 'white', 'platinum'] as const,
          metalLabels: ['Yellow Gold', 'Rose Gold', 'White Gold', 'Platinum'],
        },
      ],
    },
  },
  { label: 'Hip Hop', href: '/hiphop' },
  { label: 'Bespoke', href: '/bespoke' },
];

const MOBILE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Fine Jewellery', href: '/shop' },
  { label: 'Engagement Rings', href: '/shop?category=engagement' },
  { label: 'Wedding Bands', href: '/shop?category=wedding' },
  { label: 'Hip Hop', href: '/hiphop' },
  { label: 'Bespoke', href: '/bespoke' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
];

// ── Logo mark ──────────────────────────────────────────────────────
function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <span className="flex-shrink-0 inline-flex items-center justify-center">
      <Image
        src="/logo.jpeg"
        alt="House of Diams"
        width={size}
        height={size}
        priority
        className="rounded-sm"
        style={{ width: size, height: size }}
      />
    </span>
  );
}

// ── Mega dropdown section ──────────────────────────────────────────
type Section = {
  title: string;
  links?: string[];
  twoCol?: boolean;
  metals?: readonly ('yellow' | 'rose' | 'white' | 'platinum')[];
  metalLabels?: string[];
};

function MegaSection({ section }: { section: Section }) {
  return (
    <div className="flex flex-col">
      <div
        className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#111] mb-[22px] pb-3 border-b border-black/[0.06]"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {section.title}
      </div>

      {/* Metal list */}
      {section.metals && section.metalLabels && (
        <div className="flex flex-col">
          {section.metals.map((metal, i) => (
            <a
              key={metal}
              href="#"
              className="flex items-center gap-[14px] py-[10px] text-[13.5px] font-light tracking-[0.02em] text-[#555] no-underline transition-all duration-250 hover:text-[#111] hover:pl-1.5 group"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <MetalDot type={metal} />
              {section.metalLabels![i]}
            </a>
          ))}
        </div>
      )}

      {/* Two-col link grid */}
      {section.twoCol && section.links && (
        <div className="grid grid-cols-2 gap-x-7">
          {section.links.map((link) => (
            <a
              key={link}
              href="#"
              className="block py-[10px] text-[13.5px] font-light tracking-[0.02em] text-[#555] no-underline transition-all duration-250 hover:text-[#111] hover:pl-1.5"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {link}
            </a>
          ))}
        </div>
      )}

      {/* Single-col links */}
      {!section.twoCol && !section.metals && section.links && (
        <div className="flex flex-col">
          {section.links.map((link) => (
            <a
              key={link}
              href="#"
              className="block py-[10px] text-[13.5px] font-light tracking-[0.02em] text-[#555] no-underline transition-all duration-250 hover:text-[#111] hover:pl-1.5"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);

      const previousScrollY = lastScrollY.current;
      const scrollingDown = currentScrollY > previousScrollY + 4;
      const scrollingUp = currentScrollY < previousScrollY - 4;

      if (currentScrollY < 20) {
        setNavHidden(false);
      } else if (scrollingDown) {
        setNavHidden(true);
      } else if (scrollingUp) {
        setNavHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ── Announcement bar ───────────────────────────────────── */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
        /* Mega dropdown hover logic via CSS group */
        .mega-parent:hover .mega-drop {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateY(0) !important;
        }
        .nav-link-underline::after {
          content: '';
          position: absolute;
          bottom: 0; left: 30px; right: 30px;
          height: 2px;
          background: #111;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform .35s cubic-bezier(.4,0,.2,1);
        }
        .mega-parent:hover .nav-link-underline::after,
        .nav-link-underline:hover::after {
          transform: scaleX(1);
        }
      `}</style>

      <div className="fixed top-0 left-0 right-0 z-[1001] bg-[#14120D] text-[#E8D898] py-[9px] px-5 text-[10px] tracking-[0.24em] uppercase font-light select-none overflow-hidden whitespace-nowrap"
        style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="animate-marquee-slow">
          {[0, 1].map((i) => (
            <span key={i} className="flex items-center pr-4">
              Free Worldwide Insured Shipping
              <span className="inline-block w-1 h-1 rounded-full bg-[#B8922A] mx-[14px] align-middle" />
              IGI &amp; GIA Certified
              <span className="inline-block w-1 h-1 rounded-full bg-[#B8922A] mx-[14px] align-middle" />
              Bespoke Orders Accepted
              <span className="inline-block w-1 h-1 rounded-full bg-[#B8922A] mx-[14px] align-middle" />
            </span>
          ))}
        </div>
      </div>

      {/* ── Nav wrapper ────────────────────────────────────────── */}
      <header
        id="hod-nav"
        className={[
          'fixed left-0 right-0 top-[35px] z-[1000] bg-white',
          'border-b border-black/[0.06]',
          'transition-[transform,shadow] duration-300 ease-out',
          scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.06)]' : '',
        ].join(' ')}
        style={{
          transform: navHidden ? 'translateY(-120%)' : 'translateY(0)',
        }}
      >
        {/* ── Top row: logo + icons ───────────────────────────── */}
        <div className="flex items-center justify-center relative px-5 sm:px-7 lg:px-[52px] pt-[22px] pb-[14px] border-b border-black/[0.04]">
          {/* Logo — centered */}
          <a
            href="/"
            className="flex items-center gap-[14px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-60"
          >
            <LogoMark size={34} />
            <span
              className="text-[22px] sm:text-[28px] lg:text-[32px] font-normal tracking-[0.3em] sm:tracking-[0.38em] lg:tracking-[0.4em] uppercase text-[#111]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              House of Diams
            </span>
          </a>

          {/* Icons — absolute right */}
          <div className="absolute right-5 sm:right-7 lg:right-[52px] top-1/2 -translate-y-1/2 flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <button
              onClick={() => (window.location.href = '/shop')}
              aria-label="Search"
              className="w-[38px] h-[38px] rounded-full border border-black/10 bg-transparent flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-[#B8922A] hover:bg-[#B8922A]/[0.06] group"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#333" strokeWidth="1.4" className="group-hover:stroke-[#B8922A] transition-colors">
                <circle cx="7.5" cy="7.5" r="5.5" />
                <path d="M12 12L16 16" strokeLinecap="round" />
              </svg>
            </button>

            {/* Wishlist */}
            <button
              aria-label="Wishlist"
              className="w-[38px] h-[38px] rounded-full border border-black/10 bg-transparent flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-[#B8922A] hover:bg-[#B8922A]/[0.06] group"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#333" strokeWidth="1.4" strokeLinejoin="round" className="group-hover:stroke-[#B8922A] transition-colors">
                <path d="M9 16L3 10C1.5 8.5 1.5 5.5 3 4C4.5 2.5 7 2.5 9 4C11 2.5 13.5 2.5 15 4C16.5 5.5 16.5 8.5 15 10L9 16Z" />
              </svg>
            </button>

            {/* Account */}
            <button
              aria-label="Account"
              className="w-[38px] h-[38px] rounded-full border border-black/10 bg-transparent flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-[#B8922A] hover:bg-[#B8922A]/[0.06] group"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#333" strokeWidth="1.4" className="group-hover:stroke-[#B8922A] transition-colors">
                <circle cx="9" cy="6" r="3.5" />
                <path d="M2.5 17C2.5 13 5.2 10.5 9 10.5C12.8 10.5 15.5 13 15.5 17" strokeLinecap="round" />
              </svg>
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="flex lg:hidden flex-col gap-[5px] p-1 border-none bg-transparent cursor-pointer w-7 ml-1"
            >
              <span
                className="block h-[1.5px] w-full bg-[#111] rounded-sm origin-center transition-transform duration-350"
                style={{ transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }}
              />
              <span
                className="block h-[1.5px] bg-[#111] rounded-sm ml-auto transition-opacity duration-350"
                style={{ width: '70%', opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block h-[1.5px] bg-[#111] rounded-sm origin-center transition-transform duration-350"
                style={{ transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none', width: '100%' }}
              />
            </button>
          </div>
        </div>

        {/* ── Bottom row: desktop nav links ──────────────────── */}
        {/* nav is position:relative — dropdowns anchor to it for full-width edge-to-edge */}
        <nav className="hidden lg:flex items-center justify-center relative">
          <ul className="flex items-center list-none m-0 p-0">
            {NAV_ITEMS.map((item) => (
              /* position:static on li so the dropdown escapes to nav's positioning context */
              <li key={item.label} className={item.mega ? 'mega-parent' : ''} style={{ position: 'static' }}>
                <a
                  href={item.href ?? '#'}
                  className="nav-link-underline relative block px-[30px] py-[16px] text-[11px] font-medium tracking-[0.2em] uppercase text-[#333] no-underline cursor-pointer transition-colors duration-300 hover:text-[#111]"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {item.label}
                </a>

                {/* Mega dropdown — left:0 right:0 relative to nav = full width */}
                {item.mega && (
                  <div
                    className="mega-drop absolute left-0 right-0 top-full bg-white border-t-2 border-[#111] shadow-[0_24px_64px_rgba(0,0,0,0.08)]"
                    style={{
                      opacity: 0,
                      visibility: 'hidden',
                      pointerEvents: 'none',
                      transform: 'translateY(6px)',
                      transition: 'opacity .25s ease, visibility .25s, transform .25s ease',
                      zIndex: 100,
                    }}
                  >
                    <div className="max-w-[1280px] mx-auto px-[100px] py-[56px]">
                      <div className={`grid gap-0 ${item.mega.cols === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                        {item.mega.sections.map((section, idx) => (
                          <div
                            key={section.title}
                            className={[
                              'px-[52px]',
                              idx === 0 ? 'pl-0' : '',
                              idx === item.mega!.sections.length - 1 ? 'pr-0' : 'border-r border-black/[0.05]',
                            ].join(' ')}
                          >
                            <MegaSection section={section} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ── Mobile overlay ─────────────────────────────────────── */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className="fixed inset-0 z-[998] transition-[opacity,visibility] duration-400"
        style={{
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: menuOpen ? 'blur(4px)' : 'none',
          opacity: menuOpen ? 1 : 0,
          visibility: menuOpen ? 'visible' : 'hidden',
        }}
      />

      {/* ── Mobile drawer ──────────────────────────────────────── */}
      <div
        className="fixed top-0 right-0 w-full max-w-[420px] h-screen z-[999] bg-white border-l border-black/[0.06] pt-[100px] px-10 pb-10 flex flex-col overflow-y-auto"
        style={{
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.5s cubic-bezier(0.77,0,0.18,1)',
        }}
      >
        {MOBILE_LINKS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={closeMenu}
            className="block py-4 text-[26px] font-normal tracking-[0.05em] border-b border-black/[0.06] no-underline text-[#111] transition-all duration-300 hover:text-[#B8922A] hover:pl-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {item.label}
          </a>
        ))}

        <div className="mt-auto pt-10">
          <a
            href="/contact"
            className="text-[10px] tracking-[0.25em] uppercase text-[#B8922A] no-underline py-1.5 font-normal transition-opacity duration-300 hover:opacity-70"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Enquire →
          </a>
        </div>
      </div>
    </>
  );
}
