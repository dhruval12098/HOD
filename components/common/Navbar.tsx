'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  buildNavbarRenderItems,
  type NavbarRenderItem,
  type NavbarRenderSection,
} from '@/lib/navbar';
import { getCollectionHref } from '@/lib/browse-context';
import type { User } from '@supabase/supabase-js';

const METAL_COLORS: Record<string, string> = {
  yellow: 'linear-gradient(135deg,#F5D76E,#20304A)',
  rose: 'linear-gradient(135deg,#F0C4B0,#D4967A)',
  white: 'linear-gradient(135deg,#F0F0F0,#D8D8D8)',
  platinum: 'linear-gradient(135deg,#E8E8E8,#C0C0C0)',
  default: 'linear-gradient(135deg,#E5E7EB,#9CA3AF)',
};

function MetalDot({ type }: { type: keyof typeof METAL_COLORS }) {
  return (
    <span
      className="inline-block w-5 h-5 rounded-full border border-black/10 flex-shrink-0"
      style={{ background: METAL_COLORS[type] }}
    />
  );
}

function MegaSection({ section }: { section: NavbarRenderSection }) {
  return (
    <div className="flex flex-col">
      <div
        className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0A1628] mb-[22px] pb-3 border-b border-black/[0.06]"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {section.title}
      </div>

      {section.metals && (
        <div className="flex flex-col">
          {section.metals.map((metal) => (
            <a
              key={`${metal.type}-${metal.label}`}
              href={metal.href}
              className="flex items-center gap-[14px] py-[10px] text-[13.5px] font-light tracking-[0.02em] text-[#555] no-underline transition-all duration-250 hover:text-[#0A1628] hover:pl-1.5 group"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <MetalDot type={metal.type as keyof typeof METAL_COLORS} />
              {metal.label}
            </a>
          ))}
        </div>
      )}

      {section.metals && section.links && section.links.length > 0 && (
        <div className="mt-4 flex flex-col border-t border-black/[0.06] pt-4">
          {section.links.map((link) => (
            <a
              key={`${section.title}-${link.label}`}
              href={link.href}
              className="block py-[10px] text-[13.5px] font-light tracking-[0.02em] text-[#555] no-underline transition-all duration-250 hover:text-[#0A1628] hover:pl-1.5"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {section.twoCol && section.links && !section.metals && (
        <div className="grid grid-cols-2 gap-x-7">
          {section.links.map((link) => (
            <a
              key={`${section.title}-${link.label}`}
              href={link.href}
              className="block py-[10px] text-[13.5px] font-light tracking-[0.02em] text-[#555] no-underline transition-all duration-250 hover:text-[#0A1628] hover:pl-1.5"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {!section.twoCol && !section.metals && section.links && (
        <div className="flex flex-col">
          {section.links.map((link) => (
            <a
              key={`${section.title}-${link.label}`}
              href={link.href}
              className="block py-[10px] text-[13.5px] font-light tracking-[0.02em] text-[#555] no-underline transition-all duration-250 hover:text-[#0A1628] hover:pl-1.5"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [navItems, setNavItems] = useState<NavbarRenderItem[]>([]);
  const [announcementItems, setAnnouncementItems] = useState<
    Array<{ message: string; link_url: string; open_in_new_tab: boolean }>
  >([
    { message: 'Free Worldwide Insured Shipping', link_url: '', open_in_new_tab: false },
    { message: 'IGI & GIA Certified', link_url: '', open_in_new_tab: false },
    { message: 'Bespoke Orders Accepted', link_url: '/contact', open_in_new_tab: false },
  ]);
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [announcementSpeed, setAnnouncementSpeed] = useState(40);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
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
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    let ignore = false;

    const loadNavbar = async () => {
      const [
        itemsResult,
        sectionsResult,
        linksResult,
        sourceItemsResult,
        featuredResult,
        categoriesResult,
        subcategoriesResult,
        optionsResult,
        metalsResult,
        stoneShapesResult,
        ringSizesResult,
        certificatesResult,
      ] =
        await Promise.all([
          supabase.from('navbar_items').select('*').eq('status', 'active').order('display_order', { ascending: true }),
          supabase.from('navbar_sections').select('*').eq('status', 'active').order('column_number', { ascending: true }).order('display_order', { ascending: true }),
          supabase.from('navbar_section_links').select('*').eq('status', 'active').order('display_order', { ascending: true }),
          supabase.from('navbar_section_source_items').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from('navbar_featured_cards').select('*'),
          supabase.from('catalog_categories').select('id, name, slug, display_order, status').eq('status', 'active').order('display_order', { ascending: true }),
          supabase.from('catalog_subcategories').select('*').eq('status', 'active').order('display_order', { ascending: true }),
          supabase.from('catalog_options').select('*').eq('status', 'active').order('display_order', { ascending: true }),
          supabase.from('catalog_metals').select('*').eq('status', 'active').order('display_order', { ascending: true }),
          supabase.from('catalog_stone_shapes').select('*').eq('status', 'active').order('display_order', { ascending: true }),
          supabase.from('catalog_ring_sizes').select('*').eq('status', 'active').order('display_order', { ascending: true }),
          supabase.from('catalog_certificates').select('*').order('display_order', { ascending: true }),
        ]);

      const error =
        itemsResult.error ||
        sectionsResult.error ||
        linksResult.error ||
        sourceItemsResult.error ||
        featuredResult.error ||
        categoriesResult.error ||
        subcategoriesResult.error ||
        optionsResult.error ||
        metalsResult.error ||
        stoneShapesResult.error;

      if (ignore || error || (itemsResult.data?.length ?? 0) === 0) {
        return;
      }

      setNavItems(
        buildNavbarRenderItems({
          items: itemsResult.data ?? [],
          sections: sectionsResult.data ?? [],
          sectionLinks: linksResult.data ?? [],
          sectionSourceItems: sourceItemsResult.data ?? [],
          featuredCards: featuredResult.data ?? [],
          categories: categoriesResult.data ?? [],
          subcategories: subcategoriesResult.data ?? [],
          options: optionsResult.data ?? [],
          metals: metalsResult.data ?? [],
          stoneShapes: stoneShapesResult.data ?? [],
          ringSizes: ringSizesResult.error ? [] : ringSizesResult.data ?? [],
          certificates: certificatesResult.error ? [] : certificatesResult.data ?? [],
        })
      );
    };

    void loadNavbar();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadAnnouncementBar = async () => {
      const { data: sectionData, error: sectionError } = await supabase
        .from('support_announcement_bar')
        .select('id, is_active, speed_ms')
        .eq('section_key', 'global_support_announcement_bar')
        .maybeSingle();

      if (ignore || sectionError || !sectionData?.id) return;

      const { data: itemData, error: itemError } = await supabase
        .from('support_announcement_bar_items')
        .select('message, link_url, open_in_new_tab, is_active, sort_order')
        .eq('bar_id', sectionData.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (ignore || itemError) return;

      setAnnouncementActive(sectionData.is_active);
      setAnnouncementSpeed(sectionData.speed_ms || 40);

      if ((itemData?.length ?? 0) > 0) {
        setAnnouncementItems(
          itemData.map((item) => ({
            message: item.message,
            link_url: item.link_url ?? '',
            open_in_new_tab: Boolean(item.open_in_new_tab),
          }))
        );
      }
    };

    void loadAnnouncementBar();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setAuthUser(data.session?.user ?? null);
      setAuthReady(true);
    };

    void loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    closeMenu();
    router.replace('/login');
    router.refresh();
  };

  const mobileLinks = useMemo(
    () => [
      { label: 'Home', href: '/' },
      ...navItems.map((item) => ({ label: item.label, href: item.href ?? '#' })),
      { label: 'About Us', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
    ],
    [navItems]
  );

  const username = (() => {
    const metadata = authUser?.user_metadata;
    const preferredKeys = ['username', 'full_name', 'name', 'given_name'];

    for (const key of preferredKeys) {
      const value = metadata?.[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }

    return authUser?.email?.split('@')[0] ?? 'Profile';
  })();

  return (
    <>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          display: flex;
          width: max-content;
          animation: marquee var(--announcement-speed, 40s) linear infinite;
        }
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
          background: var(--theme-ink);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform .35s cubic-bezier(.4,0,.2,1);
        }
        .mega-parent:hover .nav-link-underline::after,
        .nav-link-underline:hover::after {
          transform: scaleX(1);
        }
      `}</style>

      {announcementActive ? (
        <div
          className="fixed top-0 left-0 right-0 z-[1001] overflow-hidden whitespace-nowrap bg-[var(--theme-ink)] px-5 py-[9px] text-[10px] font-light uppercase tracking-[0.24em] text-white select-none"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            ['--announcement-speed' as string]: `${Math.max(announcementSpeed, 10)}s`,
          }}
        >
          <div className="animate-marquee-slow">
            {[0, 1].map((dupIndex) => (
              <span key={dupIndex} className="flex items-center pr-4">
                {announcementItems.map((item, itemIndex) => (
                  <span key={`${dupIndex}-${itemIndex}`} className="flex items-center">
                    {item.link_url ? (
                      <Link
                        href={item.link_url}
                        target={item.open_in_new_tab ? '_blank' : undefined}
                        rel={item.open_in_new_tab ? 'noreferrer' : undefined}
                        className="transition-opacity duration-200 hover:opacity-70"
                      >
                        {item.message}
                      </Link>
                    ) : (
                      <span>{item.message}</span>
                    )}
                    <span className="mx-[14px] inline-block h-1 w-1 rounded-full bg-[var(--theme-surface-soft)] align-middle" />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <header
        id="hod-nav"
        className={[
          `fixed left-0 right-0 ${announcementActive ? 'top-[35px]' : 'top-0'} z-[1000] bg-white`,
          'border-b border-black/[0.06]',
          'transition-[transform,shadow] duration-300 ease-out',
          scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.06)]' : '',
        ].join(' ')}
        style={{
          transform: navHidden ? 'translateY(-120%)' : 'translateY(0)',
        }}
      >
        <div className="flex items-center justify-start lg:justify-center relative px-5 sm:px-7 lg:px-[52px] pt-[22px] pb-[14px] border-b border-black/[0.04]">
          <Link
            href="/"
            className="flex items-center gap-[14px] pr-[112px] sm:pr-[132px] lg:pr-0 no-underline cursor-pointer transition-opacity duration-300 hover:opacity-60"
          >
            <span
              className="text-[16px] sm:text-[24px] lg:text-[22px] font-normal tracking-[0.24em] sm:tracking-[0.34em] lg:tracking-[0.4em] uppercase text-[#0A1628]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              House of Diams
            </span>
          </Link>

          <div className="absolute right-5 sm:right-7 lg:right-[52px] top-1/2 -translate-y-1/2 flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.push(getCollectionHref())}
              aria-label="Search"
              className="w-[38px] h-[38px] rounded-full border border-black/10 bg-transparent flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-[#0A1628] hover:bg-[#0A1628]/[0.06] group"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#333" strokeWidth="1.4" className="group-hover:stroke-[#0A1628] transition-colors">
                <circle cx="7.5" cy="7.5" r="5.5" />
                <path d="M12 12L16 16" strokeLinecap="round" />
              </svg>
            </button>

            <button
              aria-label="Wishlist"
              className="w-[38px] h-[38px] rounded-full border border-black/10 bg-transparent flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-[#0A1628] hover:bg-[#0A1628]/[0.06] group"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#333" strokeWidth="1.4" strokeLinejoin="round" className="group-hover:stroke-[#0A1628] transition-colors">
                <path d="M9 16L3 10C1.5 8.5 1.5 5.5 3 4C4.5 2.5 7 2.5 9 4C11 2.5 13.5 2.5 15 4C16.5 5.5 16.5 8.5 15 10L9 16Z" />
              </svg>
            </button>

            {authReady && authUser ? (
              <Link
                href="/profile"
                className="hidden sm:inline-flex h-[42px] items-center justify-center rounded-full border border-[rgba(10,22,40,0.1)] bg-[rgba(10,22,40,0.03)] px-5 text-[10px] font-medium uppercase tracking-[0.26em] text-[#0A1628] transition-all duration-300 hover:border-[#0A1628] hover:bg-[#0A1628] hover:text-white"
              >
                {username}
              </Link>
            ) : (
              <Link
                href="/signup"
                className="hidden sm:inline-flex h-[42px] items-center justify-center rounded-full bg-[#0A1628] px-5 text-[10px] font-medium uppercase tracking-[0.28em] text-white transition-all duration-300 hover:bg-[#13233b]"
              >
                Sign Up
              </Link>
            )}

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="flex lg:hidden flex-col gap-[5px] p-1 border-none bg-transparent cursor-pointer w-7 ml-1"
            >
              <span
                className="block h-[1.5px] w-full bg-[#0A1628] rounded-sm origin-center transition-transform duration-350"
                style={{ transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }}
              />
              <span
                className="block h-[1.5px] bg-[#0A1628] rounded-sm ml-auto transition-opacity duration-350"
                style={{ width: '70%', opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block h-[1.5px] bg-[#0A1628] rounded-sm origin-center transition-transform duration-350"
                style={{ transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none', width: '100%' }}
              />
            </button>
          </div>
        </div>

        <nav className="hidden lg:flex items-center justify-center relative">
          <ul className="flex items-center list-none m-0 p-0">
            {navItems.map((item) => (
              <li key={item.label} className={item.mega ? 'mega-parent' : ''} style={{ position: 'static' }}>
                <a
                  href={item.href ?? '#'}
                  className="nav-link-underline relative block px-[30px] py-[16px] text-[11px] font-medium tracking-[0.2em] uppercase text-[#333] no-underline cursor-pointer transition-colors duration-300 hover:text-[#0A1628]"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {item.label}
                </a>

                {item.mega ? (
                  <div
                    className="mega-drop absolute left-0 right-0 top-full bg-white border-t-2 border-[#0A1628] shadow-[0_24px_64px_rgba(0,0,0,0.08)]"
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
                            key={`${item.label}-${section.title}-${idx}`}
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
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      </header>

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

      <div
        className="fixed top-0 right-0 w-full max-w-[420px] h-screen z-[999] bg-white border-l border-black/[0.06] pt-[100px] px-10 pb-10 flex flex-col overflow-y-auto"
        style={{
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.5s cubic-bezier(0.77,0,0.18,1)',
        }}
      >
        {mobileLinks.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={closeMenu}
            className="block py-4 text-[26px] font-normal tracking-[0.05em] border-b border-black/[0.06] no-underline text-[#0A1628] transition-all duration-300 hover:text-[#0A1628] hover:pl-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {item.label}
          </a>
        ))}

        <div className="mt-6 grid gap-3">
          {authReady && authUser ? (
            <>
              <Link
                href="/profile"
                onClick={closeMenu}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#0A1628] px-6 text-[11px] uppercase tracking-[0.28em] text-white transition hover:bg-[#13233b]"
              >
                {username}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-black/12 px-6 text-[11px] uppercase tracking-[0.28em] text-[#0A1628] transition hover:border-[#0A1628]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                onClick={closeMenu}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#0A1628] px-6 text-[11px] uppercase tracking-[0.28em] text-white transition hover:bg-[#13233b]"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                onClick={closeMenu}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-black/12 px-6 text-[11px] uppercase tracking-[0.28em] text-[#0A1628] transition hover:border-[#0A1628]"
              >
                Login
              </Link>
            </>
          )}
        </div>

        <div className="mt-auto pt-10">
          <Link
            href="/contact"
            className="text-[10px] tracking-[0.25em] uppercase text-[#0A1628] no-underline py-1.5 font-normal transition-opacity duration-300 hover:opacity-70"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Enquire →
          </Link>
        </div>
      </div>
    </>
  );
}
