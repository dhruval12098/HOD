'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Bespoke', href: '/bespoke' },
  { label: 'B2B', href: '/b2b' },
  { label: 'Contact', href: '/contact' },
];

function LogoMark() {
  return (
    <span className="flex-shrink-0 inline-flex items-center justify-center">
      <Image
        src="/logo.jpeg"
        alt="House of Diams"
        width={28}
        height={28}
        priority
        className="rounded-sm"
        style={{ width: 28, height: 28 }}
      />
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [activePath, setActivePath] = useState('/');

  useEffect(() => {
    setActivePath(window.location.pathname);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ── Announcement bar ── */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
      `}</style>
      <div className="fixed top-0 left-0 right-0 z-[1001] bg-[#14120D] text-[#E8D898] py-[9px] px-5 text-[10px] tracking-[0.24em] uppercase font-['Montserrat',sans-serif] font-light select-none overflow-hidden whitespace-nowrap">
        <div className="animate-marquee-slow">
          <span className="flex items-center pr-4">
            Free Worldwide Insured Shipping
            <span className="inline-block w-1 h-1 rounded-full bg-[#B8922A] mx-[14px] align-middle" />
            IGI &amp; GIA Certified
            <span className="inline-block w-1 h-1 rounded-full bg-[#B8922A] mx-[14px] align-middle" />
            Bespoke Orders Accepted
            <span className="inline-block w-1 h-1 rounded-full bg-[#B8922A] mx-[14px] align-middle" />
          </span>
          {/* Duplicate for seamless loop */}
          <span className="flex items-center pr-4">
            Free Worldwide Insured Shipping
            <span className="inline-block w-1 h-1 rounded-full bg-[#B8922A] mx-[14px] align-middle" />
            IGI &amp; GIA Certified
            <span className="inline-block w-1 h-1 rounded-full bg-[#B8922A] mx-[14px] align-middle" />
            Bespoke Orders Accepted
            <span className="inline-block w-1 h-1 rounded-full bg-[#B8922A] mx-[14px] align-middle" />
          </span>
        </div>
      </div>

      {/* ── Nav bar ── */}
      <nav
        className={[
          'fixed left-0 right-0 top-[35px] z-[1000] h-[76px]',
          'flex items-center justify-between px-5 sm:px-7 lg:px-[52px]',
          'transition-[background,border-color,box-shadow] duration-400 ease-in-out',
          scrolled
            ? 'bg-[rgba(251,249,245,0.97)] border-b border-[rgba(20,18,13,0.10)] shadow-[0_2px_24px_rgba(20,18,13,0.04)]'
            : 'bg-[rgba(251,249,245,0.92)] border-b border-transparent',
        ].join(' ')}
        style={{
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-[10px] no-underline flex-shrink min-w-0 transition-opacity duration-300 hover:opacity-60 cursor-pointer"
        >
          <LogoMark />
          <span
            className="text-[16px] sm:text-[18px] lg:text-[21px] font-normal tracking-[0.22em] sm:tracking-[0.28em] lg:tracking-[0.32em] uppercase text-[#14120D] truncate max-w-[56vw] sm:max-w-[46vw] lg:max-w-none"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            House of Diams
          </span>
        </a>

        {/* ── Desktop links ── */}
        <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0">
          {NAV_LINKS.map((link) => {
            const active = activePath === link.href;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={[
                    'relative text-[10px] font-normal tracking-[0.22em] uppercase no-underline',
                    'py-1 whitespace-nowrap transition-colors duration-300',
                    'after:absolute after:bottom-[-2px] after:left-0 after:h-px after:bg-[#B8922A]',
                    'after:transition-[width] after:duration-400',
                    active
                      ? 'text-[#B8922A] after:w-full'
                      : 'text-[#3A3628] hover:text-[#B8922A] after:w-0 hover:after:w-full',
                  ].join(' ')}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* ── Right side ── */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {/* Search btn */}
          <button
            onClick={() => (window.location.href = '/shop')}
            aria-label="Shop"
            className="w-9 h-9 rounded-full border border-[rgba(20,18,13,0.10)] bg-transparent flex items-center justify-center cursor-pointer text-[#3A3628] transition-all duration-300 hover:border-[#B8922A] hover:bg-[#F5EDD6] hover:text-[#B8922A]"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11L14 14" strokeLinecap="round" />
            </svg>
          </button>

          {/* Wishlist btn */}
          <button
            aria-label="Wishlist"
            className="relative w-9 h-9 rounded-full border border-[rgba(20,18,13,0.10)] bg-transparent flex items-center justify-center cursor-pointer text-[#3A3628] transition-all duration-300 hover:border-[#B8922A] hover:bg-[#F5EDD6] hover:text-[#B8922A]"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
              <path d="M8 14L2.5 8.5C1 7 1 4.5 2.5 3C4 1.5 6.5 1.5 8 3C9.5 1.5 12 1.5 13.5 3C15 4.5 15 7 13.5 8.5L8 14Z" />
            </svg>
          </button>

          {/* Enquire CTA — hidden on mobile */}
          <a
            href="/contact"
            className="hidden sm:inline-flex items-center gap-2 text-[9px] font-normal tracking-[0.24em] uppercase no-underline text-[#FBF9F5] bg-[#14120D] px-[22px] py-[10px] transition-all duration-300 hover:bg-[#B8922A] hover:-translate-y-px hover:shadow-[0_12px_40px_rgba(184,146,42,0.18)]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span>Enquire</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 5H9M6 2L9 5L6 8" />
            </svg>
          </a>

          {/* Hamburger — visible below lg */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="flex lg:hidden flex-col gap-[5px] p-1 border-none bg-transparent cursor-pointer w-7 ml-1"
          >
            <span
              className="block h-[1.5px] w-full bg-[#14120D] rounded-sm origin-center transition-transform duration-350"
              style={{ transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }}
            />
            <span
              className="block h-[1.5px] bg-[#14120D] rounded-sm ml-auto transition-opacity duration-350"
              style={{ width: '70%', opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block h-[1.5px] bg-[#14120D] rounded-sm origin-center transition-transform duration-350"
              style={{
                width: '100%',
                transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </div>
      </nav>

      {/* ── Overlay ── */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className="fixed inset-0 z-[998] transition-[opacity,visibility] duration-400"
        style={{
          background: 'rgba(20,18,13,0.5)',
          backdropFilter: menuOpen ? 'blur(4px)' : 'none',
          opacity: menuOpen ? 1 : 0,
          visibility: menuOpen ? 'visible' : 'hidden',
        }}
      />

      {/* ── Mobile drawer ── */}
      <div
        className="fixed top-0 right-0 w-full max-w-[420px] h-screen z-[999] bg-[#FBF9F5] border-l border-[rgba(20,18,13,0.10)] pt-[100px] px-10 pb-10 flex flex-col"
        style={{
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.5s cubic-bezier(0.77,0,0.18,1)',
        }}
      >
        {NAV_LINKS.map((link) => {
          const active = activePath === link.href;
          return (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className={[
                'block py-[18px] text-[28px] font-normal tracking-[0.05em] border-b border-[rgba(20,18,13,0.10)] no-underline transition-all duration-300 hover:pl-2',
                active ? 'text-[#B8922A]' : 'text-[#14120D] hover:text-[#B8922A]',
              ].join(' ')}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {link.label}
            </a>
          );
        })}

        {/* Drawer footer */}
        <div className="mt-auto pt-10 flex gap-4">
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
