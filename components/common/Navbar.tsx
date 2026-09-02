'use client';
import { useEffect, useMemo, useRef, useState, type AnchorHTMLAttributes, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ReactCountryFlag from 'react-country-flag';
import { loaderWordmarkFont } from '@/app/fonts';
import { supabase } from '@/lib/supabase';
import {
  type NavbarRenderItem,
  type NavbarRenderSection,
} from '@/lib/navbar';
import type { User } from '@supabase/supabase-js';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlistStore } from '@/lib/hooks/useWishlistStore';
import { useCart } from '@/lib/hooks/useCart';

const METAL_COLORS: Record<string, string> = {
  yellow: 'linear-gradient(135deg,#F5D76E,#20304A)',
  rose: 'linear-gradient(135deg,#F0C4B0,#D4967A)',
  white: 'linear-gradient(135deg,#F0F0F0,#D8D8D8)',
  platinum: 'linear-gradient(135deg,#E8E8E8,#C0C0C0)',
  default: 'linear-gradient(135deg,#E5E7EB,#9CA3AF)',
};

const OVERLAY_NAVBAR_ROUTES = new Set(['/', '/hiphop', '/bespoke']);
const DETECTED_COUNTRY_COOKIE = 'detected_country';

function readDetectedCountryCookie() {
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${DETECTED_COUNTRY_COOKIE}=`));
  if (!cookie) return '';

  try {
    const countryCode = decodeURIComponent(cookie.slice(DETECTED_COUNTRY_COOKIE.length + 1)).toUpperCase();
    return /^[A-Z]{2}$/.test(countryCode) ? countryCode : '';
  } catch {
    return '';
  }
}

function getCountryName(countryCode: string) {
  if (!countryCode) return 'Location unavailable';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}

function DetectedCountryIndicator({
  countryCode,
  borderColor = 'rgba(0,0,0,0.1)',
  background = 'transparent',
}: {
  countryCode: string;
  borderColor?: string;
  background?: string;
}) {
  const normalizedCountryCode = countryCode.toUpperCase();
  const countryName = getCountryName(normalizedCountryCode);
  const hasCountryFlag = /^[A-Z]{2}$/.test(normalizedCountryCode);

  return (
    <span
      role="img"
      aria-label={`Currency region: ${countryName}`}
      title={`Currency region: ${countryName}`}
      className="inline-flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full text-[16px] leading-none transition-all duration-300"
      style={{ border: `1px solid ${borderColor}`, background }}
    >
      {hasCountryFlag ? (
        <ReactCountryFlag
          countryCode={normalizedCountryCode}
          svg
          aria-label={countryName}
          style={{ width: '18px', height: '18px', borderRadius: '999px' }}
        />
      ) : (
        <span aria-hidden="true">🌐</span>
      )}
    </span>
  );
}

function SmartNavLink({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const isInternalRoute = href.startsWith('/') && !href.startsWith('//');
  return isInternalRoute ? <Link href={href} {...props} /> : <a href={href} {...props} />;
}

function MetalDot({ type, colorHex }: { type: keyof typeof METAL_COLORS; colorHex?: string | null }) {
  const color = typeof colorHex === 'string' && colorHex.trim().length > 0
    ? colorHex.trim()
    : METAL_COLORS[type];

  return (
    <span
      className="inline-block h-5 w-5 flex-shrink-0 rounded-full border-[5px] bg-transparent"
      style={{ borderColor: color }}
    />
  );
}

function MegaSection({ section, onNavigate }: { section: NavbarRenderSection; onNavigate?: () => void }) {
  const entries = [
    ...(section.metals?.map((metal) => ({
      kind: 'metal' as const, key: `${metal.type}-${metal.label}`, label: metal.label,
      href: metal.href, type: metal.type, colorHex: metal.colorHex,
    })) ?? []),
    ...(section.links?.map((link) => ({
      kind: 'link' as const, key: `${section.title}-${link.label}`, label: link.label,
      href: link.href, iconUrl: link.iconUrl,
    })) ?? []),
  ];
  const rowCount = Math.min(5, entries.length);

  return (
    <div className="flex flex-col">
      <div
        className="mb-[22px] flex items-center gap-2 border-b border-black/[0.06] pb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0A1628]"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {section.iconUrl ? (
          <img
            src={section.iconUrl}
            alt=""
            aria-hidden="true"
            className="h-5 w-5 flex-shrink-0 object-contain"
          />
        ) : null}
        <span>{section.title}</span>
      </div>

      {entries.length > 0 ? (
        <div
          className="grid grid-flow-col gap-x-7 gap-y-1"
          style={{
            gridTemplateRows: `repeat(${rowCount}, minmax(0, auto))`,
            gridAutoColumns: 'minmax(0, 1fr)',
          }}
        >
          {entries.map((entry) => (
            <SmartNavLink
              key={entry.key}
              href={entry.href}
              onClick={onNavigate}
              className="flex items-center gap-[14px] py-[10px] text-[13.5px] font-light tracking-[0.02em] text-[#555] no-underline transition-all duration-250 hover:text-[#0A1628] hover:pl-1.5 group"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {entry.kind === 'metal' ? (
                <MetalDot type={entry.type as keyof typeof METAL_COLORS} colorHex={entry.colorHex} />
              ) : entry.iconUrl ? (
                <img src={entry.iconUrl} alt={entry.label} className="h-7 w-7 flex-shrink-0 object-contain" />
              ) : null}
              {entry.label}
            </SmartNavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getMobileSectionEntries(section: NavbarRenderSection) {
  const metalEntries =
    section.metals?.map((metal) => ({
      label: metal.label,
      href: metal.href,
      icon: <MetalDot type={metal.type as keyof typeof METAL_COLORS} colorHex={metal.colorHex} />,
    })) ?? [];

  const linkEntries =
    section.links?.map((link) => ({
      label: link.label,
      href: link.href,
      icon: link.iconUrl ? (
        <img
          src={link.iconUrl}
          alt={link.label}
            className="h-5 w-5 flex-shrink-0 object-contain"
        />
      ) : null,
    })) ?? [];

  return [...metalEntries, ...linkEntries];
}

function getMegaMenuColumnCount(item: NavbarRenderItem) {
  return item.mega?.sections.reduce((total, section) => total + getSectionColumnCount(section), 0) ?? 1;
}

function getSectionColumnCount(section: NavbarRenderSection) {
  const optionCount = (section.metals?.length ?? 0) + (section.links?.length ?? 0);
  return Math.max(1, Math.ceil(optionCount / 5));
}

export default function Navbar({ navItems = [] }: { navItems?: NavbarRenderItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const { count: wishlistCount } = useWishlistStore();
  const { count: cartCount } = useCart();
  const { format, selected } = useCurrency();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpenItem, setMobileOpenItem] = useState<string | null>(null);
  const [activeMegaItem, setActiveMegaItem] = useState<string | null>(null);
  const [navHidden, setNavHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [searchItems, setSearchItems] = useState<Array<{ dbId?: string; slug: string; name: string; shortMeta: string; imageUrl?: string; priceFrom: number }>>([]);
  const [detectedCountry, setDetectedCountry] = useState('');
  const displayedCountry = detectedCountry || selected.countryCode;
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
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchOptionRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const megaCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchedNavRoutesRef = useRef(new Set<string>());
  const searchLoadStartedRef = useRef(false);

  useEffect(() => {
    let ignore = false;
    const countryCode = readDetectedCountryCookie();
    window.queueMicrotask(() => {
      if (!ignore) setDetectedCountry(countryCode);
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let frameId: number | null = null;

    const updateNavbarForScroll = () => {
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

    const onScroll = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateNavbarForScroll();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateNavbarForScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const shouldLockPage = menuOpen || searchOpen;
    document.body.style.overflow = shouldLockPage ? 'hidden' : '';
    document.documentElement.style.overscrollBehavior = shouldLockPage ? 'none' : '';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (!searchOpen || searchItems.length > 0 || searchLoadStartedRef.current) return;
    let ignore = false;
    searchLoadStartedRef.current = true;
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/public/products/search');
        const payload = await response.json().catch(() => null);
        if (!ignore && response.ok && Array.isArray(payload?.items)) {
          setSearchItems(payload.items);
        }
      } finally {
        if (!ignore) searchLoadStartedRef.current = false;
      }
    };
    void loadProducts();
    return () => {
      ignore = true;
    };
  }, [searchItems.length, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest('[data-navbar-search-root]')) {
        setSearchOpen(false);
        setActiveSearchIndex(-1);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
        setActiveSearchIndex(-1);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    return () => {
      if (megaCloseTimeoutRef.current) {
        clearTimeout(megaCloseTimeoutRef.current);
      }
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

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setAuthUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileOpenItem(null);
  };

  const openMegaMenu = (label: string) => {
    if (megaCloseTimeoutRef.current) {
      clearTimeout(megaCloseTimeoutRef.current);
      megaCloseTimeoutRef.current = null;
    }
    setActiveMegaItem(label);
  };

  const prefetchMegaMenu = (item: NavbarRenderItem) => {
    const hrefs = [
      item.href,
      ...(item.mega?.sections.flatMap((section) => [
        ...(section.metals?.map((metal) => metal.href) ?? []),
        ...(section.links?.map((link) => link.href) ?? []),
      ]) ?? []),
    ];

    for (const href of hrefs) {
      if (!href?.startsWith('/') || href.startsWith('//') || prefetchedNavRoutesRef.current.has(href)) continue;
      prefetchedNavRoutesRef.current.add(href);
      router.prefetch(href);
    }
  };

  const closeMegaMenu = () => {
    if (megaCloseTimeoutRef.current) {
      clearTimeout(megaCloseTimeoutRef.current);
      megaCloseTimeoutRef.current = null;
    }
    setActiveMegaItem(null);
  };

  const queueCloseMegaMenu = (label: string) => {
    if (megaCloseTimeoutRef.current) {
      clearTimeout(megaCloseTimeoutRef.current);
    }
    megaCloseTimeoutRef.current = setTimeout(() => {
      setActiveMegaItem((current) => (current === label ? null : current));
      megaCloseTimeoutRef.current = null;
    }, 250);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    closeMenu();
    router.replace('/login');
    router.refresh();
  };

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
  const filteredSearchItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    const queryTokens = query.split(/\s+/).filter(Boolean);
    return searchItems
      .filter((item) => {
        const haystack = [
          item.name,
          item.shortMeta,
          item.slug,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return queryTokens.every((token) => haystack.includes(token));
      });
  }, [searchItems, searchQuery]);

  useEffect(() => {
    if (activeSearchIndex < 0) return;
    searchOptionRefs.current[activeSearchIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeSearchIndex]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setActiveSearchIndex(-1);
  };

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSearch();
      return;
    }

    if (!filteredSearchItems.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSearchIndex((current) => (current + 1) % filteredSearchItems.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSearchIndex((current) => (current <= 0 ? filteredSearchItems.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Enter') {
      const selectedItem = filteredSearchItems[activeSearchIndex >= 0 ? activeSearchIndex : 0];
      if (!selectedItem) return;
      event.preventDefault();
      closeSearch();
      router.push(`/shop/${selectedItem.slug}`);
    }
  };

  const desktopOverlayMode = pathname ? OVERLAY_NAVBAR_ROUTES.has(pathname) : false;
  const desktopSolidMode = !desktopOverlayMode || scrolled || Boolean(activeMegaItem) || searchOpen;
  const desktopHeaderText = desktopSolidMode ? '#0A1628' : '#FFFFFF';
  const desktopHeaderMuted = desktopSolidMode ? '#333333' : 'rgba(255,255,255,0.88)';
  const desktopHeaderBorder = desktopSolidMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.12)';
  const desktopUtilityBg = desktopSolidMode ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.08)';
  const desktopHeaderBg = desktopSolidMode ? '#FFFFFF' : 'transparent';
  const desktopHeaderShadow = scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none';

  return (
    <>
      <style>{`
        .mega-parent.mega-open .mega-drop {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateY(0) !important;
        }
        .nav-desktop-row::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity .3s ease;
          background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.26) 55%, rgba(0,0,0,0) 100%);
        }
        .nav-desktop-row[data-overlay='true']::before {
          opacity: 1;
        }
      `}</style>

      {announcementActive ? (
        <div
          className="fixed top-0 left-0 right-0 z-[1001] flex h-[35px] items-center overflow-hidden bg-[var(--theme-ink)] text-left text-[10px] font-light uppercase tracking-[0.24em] text-white select-none"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            ['--announcement-speed' as string]: `${Math.max(announcementSpeed, 10)}s`,
          }}
        >
          <div
            className="flex w-max animate-marquee-slow items-center hover:[animation-play-state:paused]"
            style={{ animationDuration: 'var(--announcement-speed, 40s)' }}
          >
            {[0, 1].map((groupIndex) => (
              <div key={groupIndex} className="flex shrink-0 items-center gap-x-[28px] px-[14px]">
                {Array.from({ length: 10 }, (_, repeatIndex) =>
                  announcementItems.map((item, itemIndex) => (
                  <span key={`${groupIndex}-${repeatIndex}-${itemIndex}`} className="flex items-center gap-x-[28px] whitespace-nowrap">
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
                    <span className="inline-block h-1 w-1 rounded-full bg-[var(--theme-surface-soft)] align-middle" />
                  </span>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <header
        id="hod-nav"
        className={[
          `fixed left-0 right-0 ${announcementActive ? 'top-[35px]' : 'top-0'} z-[1000]`,
          'transition-[transform,shadow] duration-300 ease-out',
        ].join(' ')}
        style={{
          transform: navHidden && !searchOpen && !menuOpen ? 'translateY(-120%)' : 'translateY(0)',
          background: desktopHeaderBg,
          boxShadow: desktopHeaderShadow,
          borderBottom: desktopOverlayMode && !scrolled ? 'none' : `1px solid ${desktopHeaderBorder}`,
        }}
      >
        <div
          className="nav-desktop-row relative px-0 py-0 lg:px-[34px] lg:py-[10px]"
          data-overlay={desktopOverlayMode && !desktopSolidMode ? 'true' : 'false'}
        >
          <div className="relative flex items-center justify-center border-b border-black/[0.06] bg-white px-4 py-[14px] lg:hidden">
          <div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 min-[375px]:left-4 min-[375px]:gap-2.5 sm:gap-3">
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full border border-black/10 bg-transparent transition-all duration-300 hover:border-[#0A1628] hover:bg-[#0A1628]/[0.06] group"
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="#333" strokeWidth="1.4" strokeLinejoin="round" className="group-hover:stroke-[#0A1628] transition-colors">
                <path d="M9 16L3 10C1.5 8.5 1.5 5.5 3 4C4.5 2.5 7 2.5 9 4C11 2.5 13.5 2.5 15 4C16.5 5.5 16.5 8.5 15 10L9 16Z" />
              </svg>
              {wishlistCount ? <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#0A1628] px-1 text-[10px] text-white">{wishlistCount}</span> : null}
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full border border-black/10 bg-transparent transition-all duration-300 hover:border-[#0A1628] hover:bg-[#0A1628]/[0.06] group"
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="#333" strokeWidth="1.4" className="group-hover:stroke-[#0A1628] transition-colors">
                <path d="M2.5 3.5H4.2L5.5 11.2H13.2L15.2 6H6.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7" cy="14" r="1.1" />
                <circle cx="12.5" cy="14" r="1.1" />
              </svg>
              {cartCount ? <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#0A1628] px-1 text-[10px] text-white">{cartCount}</span> : null}
            </Link>
          </div>
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 min-[375px]:right-4 min-[375px]:gap-2.5">
            <DetectedCountryIndicator countryCode={displayedCountry} />
            <button
              onClick={() => {
                if (menuOpen) closeMenu();
                else setMenuOpen(true);
              }}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="flex w-7 cursor-pointer flex-col gap-[5px] border-none bg-transparent p-1"
            >
              <span
                className="block h-[1.5px] w-full origin-center rounded-sm bg-[#0A1628] transition-transform duration-350"
                style={{ transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }}
              />
              <span
                className="ml-auto block h-[1.5px] rounded-sm bg-[#0A1628] transition-opacity duration-350"
                style={{ width: '70%', opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block h-[1.5px] origin-center rounded-sm bg-[#0A1628] transition-transform duration-350"
                style={{ transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none', width: '100%' }}
              />
            </button>
          </div>
          <Link
            href="/"
            className="flex items-center no-underline cursor-pointer transition-opacity duration-300 hover:opacity-60"
          >
            <span
              className={`${loaderWordmarkFont.className} text-[13px] min-[375px]:text-[16px] sm:text-[20px] font-semibold tracking-[0.18em] min-[375px]:tracking-[0.24em] sm:tracking-[0.3em] uppercase`}
              style={{ color: '#0A1628' }}
            >
              House of Diams
            </span>
          </Link>
          </div>

          <div className="hidden lg:grid lg:grid-cols-[auto_auto_1fr] lg:items-center lg:gap-5">
          <Link
            href="/"
            className="relative z-[2] flex items-center no-underline transition-opacity duration-300 hover:opacity-70"
          >
            <span
              className={`${loaderWordmarkFont.className} text-[16px] font-semibold uppercase tracking-[0.27em]`}
              style={{ color: desktopHeaderText }}
            >
              House of Diams
            </span>
          </Link>

          <nav className="z-[2] flex items-center justify-start">
            <ul className="flex items-center list-none m-0 p-0">
              {navItems.map((item) => (
                <li
                  key={item.label}
                  className={item.mega ? `mega-parent${activeMegaItem === item.label ? ' mega-open' : ''}` : ''}
                  style={{ position: 'static' }}
                  onMouseEnter={() => {
                    if (item.mega) {
                      openMegaMenu(item.label);
                      prefetchMegaMenu(item);
                    }
                  }}
                  onMouseLeave={() => {
                    if (item.mega) queueCloseMegaMenu(item.label);
                  }}
                >
                  <SmartNavLink
                    href={item.href ?? '#'}
                    onClick={closeMegaMenu}
                    className="nav-link-underline relative block px-[18px] py-[11px] text-[11px] font-semibold tracking-[0.19em] uppercase no-underline cursor-pointer transition-colors duration-300"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      color: desktopHeaderMuted,
                    }}
                  >
                    {item.label}
                  </SmartNavLink>

                  {item.mega ? (
                    <div
                      className="mega-drop absolute top-full overflow-hidden rounded-b-[30px] bg-white border-t-2 border-[#0A1628] shadow-[0_24px_64px_rgba(0,0,0,0.08)]"
                      style={{
                        left: '50%',
                        width: '100vw',
                        marginLeft: '-50vw',
                        opacity: 0,
                        visibility: 'hidden',
                        pointerEvents: 'none',
                        transform: 'translateY(6px)',
                        transition: 'opacity .25s ease, visibility .25s, transform .25s ease',
                        zIndex: 100,
                      }}
                      onMouseEnter={() => openMegaMenu(item.label)}
                      onMouseLeave={() => queueCloseMegaMenu(item.label)}
                    >
                      <div className="w-full px-[56px] py-[56px]">
                        <div
                          className="grid gap-y-10"
                          style={{
                            gridTemplateColumns: item.mega.featuredImage?.imageUrl
                              ? `repeat(${getMegaMenuColumnCount(item)}, minmax(0, 1fr)) minmax(360px, 1.5fr)`
                              : `repeat(${getMegaMenuColumnCount(item)}, minmax(0, 1fr))`,
                          }}
                        >
                          {item.mega.sections.map((section, idx) => (
                            <div
                              key={`${item.label}-${section.title}-${idx}`}
                              className={[
                                getMegaMenuColumnCount(item) >= 5 ? 'px-[18px]' : getMegaMenuColumnCount(item) === 4 ? 'px-[34px]' : 'px-[52px]',
                                idx === 0 ? 'pl-0' : '',
                                idx === item.mega!.sections.length - 1 ? 'pr-0' : 'border-r border-black/[0.05]',
                              ].join(' ')}
                              style={{ gridColumn: `span ${getSectionColumnCount(section)} / span ${getSectionColumnCount(section)}` }}
                            >
                              <MegaSection section={section} onNavigate={closeMegaMenu} />
                            </div>
                          ))}
                          {item.mega.featuredImage?.imageUrl ? (
                            <div className="pl-[34px]">
                              <div className="h-[300px] w-full overflow-hidden border border-black/[0.06] bg-[#F7F8FA]">
                                <img
                                  src={item.mega.featuredImage.imageUrl}
                                  alt={item.mega.featuredImage.imageAlt || item.label}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-[30] flex items-center justify-end gap-2.5">
          <div ref={searchRef} data-navbar-search-root className="relative">
            <div
              className={`flex h-[34px] items-center overflow-hidden rounded-full border transition-all duration-300 ${searchOpen ? 'w-[34px]' : 'w-[34px]'}`}
              style={{
                borderColor: desktopHeaderBorder,
                background: desktopUtilityBg,
              }}
            >
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                aria-label="Search"
                className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center"
              >
                <svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke={searchOpen ? '#333333' : desktopHeaderText} strokeWidth="1.4">
                  <circle cx="7.5" cy="7.5" r="5.5" />
                  <path d="M12 12L16 16" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {searchOpen && searchQuery.trim() ? (
              <div
                id="navbar-search-results"
                role="listbox"
                aria-label="Product search results"
                className="absolute right-0 top-[calc(100%+24px)] w-[min(760px,calc(100vw-32px))] overflow-hidden rounded-[22px] border border-black/8 bg-white shadow-[0_24px_56px_rgba(10,22,40,0.14)]"
              >
                {filteredSearchItems.length ? (
                  <div
                    className="max-h-[min(420px,calc(100dvh-190px))] touch-pan-y overflow-y-auto overscroll-contain py-2"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                    onWheel={(event) => event.stopPropagation()}
                    onTouchMove={(event) => event.stopPropagation()}
                  >
                    {filteredSearchItems.map((item, index) => (
                      <Link
                        key={item.dbId || item.slug}
                        ref={(node) => { searchOptionRefs.current[index] = node; }}
                        id={`navbar-search-option-${index}`}
                        role="option"
                        aria-selected={activeSearchIndex === index}
                        href={`/shop/${item.slug}`}
                        onMouseEnter={() => setActiveSearchIndex(index)}
                        onClick={closeSearch}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#F7F8FA] ${activeSearchIndex === index ? 'bg-[#F7F8FA]' : ''}`}
                      >
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-[14px] bg-[#F5F1E8]">
                          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium text-[#0A1628]">{item.name}</div>
                          <div className="mt-1 truncate text-[10px] uppercase tracking-[0.18em] text-[#8B94A5]">{item.shortMeta}</div>
                          <div className="mt-1 text-[12px] text-[#253246]">{format(item.priceFrom)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-5 text-[12px] text-[#6A6A6A]">No products found.</div>
                )}
              </div>
            ) : null}
          </div>
            <DetectedCountryIndicator
              countryCode={displayedCountry}
              borderColor={desktopHeaderBorder}
              background={desktopUtilityBg}
            />
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="group relative flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all duration-300"
              style={{
                border: `1px solid ${desktopHeaderBorder}`,
                background: desktopUtilityBg,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke={desktopHeaderText} strokeWidth="1.4" strokeLinejoin="round">
                <path d="M9 16L3 10C1.5 8.5 1.5 5.5 3 4C4.5 2.5 7 2.5 9 4C11 2.5 13.5 2.5 15 4C16.5 5.5 16.5 8.5 15 10L9 16Z" />
              </svg>
              {wishlistCount ? <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#0A1628] px-1 text-[10px] text-white">{wishlistCount}</span> : null}
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="group relative flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all duration-300"
              style={{
                border: `1px solid ${desktopHeaderBorder}`,
                background: desktopUtilityBg,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke={desktopHeaderText} strokeWidth="1.4">
                <path d="M2.5 3.5H4.2L5.5 11.2H13.2L15.2 6H6.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7" cy="14" r="1.1" />
                <circle cx="12.5" cy="14" r="1.1" />
              </svg>
              {cartCount ? <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#0A1628] px-1 text-[10px] text-white">{cartCount}</span> : null}
            </Link>

            {authReady && authUser ? (
              <Link
                href="/profile"
                className="inline-flex h-[34px] items-center justify-center rounded-full px-3.5 text-[8px] font-medium uppercase tracking-[0.19em] transition-all duration-300 hover:bg-white hover:text-[#0A1628]"
                style={{
                  border: `1px solid ${desktopHeaderBorder}`,
                  background: desktopUtilityBg,
                  color: desktopHeaderText,
                }}
              >
                {username}
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex h-[34px] items-center justify-center rounded-full px-3.5 text-[8px] font-medium uppercase tracking-[0.19em] transition-all duration-300 hover:bg-white hover:text-[#0A1628]"
                style={{
                  border: `1px solid ${desktopHeaderBorder}`,
                  background: desktopUtilityBg,
                  color: desktopHeaderText,
                }}
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
        {searchOpen ? (
          <div data-navbar-search-root className="relative z-[20] hidden border-t border-black/[0.06] bg-white lg:block">
            <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-[34px] py-4">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0A1628" strokeWidth="1.4">
                <circle cx="7.5" cy="7.5" r="5.5" />
                <path d="M12 12L16 16" strokeLinecap="round" />
              </svg>
              <input
                ref={searchInputRef}
                autoFocus
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setActiveSearchIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                role="combobox"
                aria-label="Search products"
                aria-autocomplete="list"
                aria-expanded={Boolean(searchQuery.trim())}
                aria-controls="navbar-search-results"
                aria-activedescendant={filteredSearchItems[activeSearchIndex] ? `navbar-search-option-${activeSearchIndex}` : undefined}
                placeholder="What can we help you with?"
                className="h-[46px] flex-1 border-0 border-b border-[rgba(10,22,40,0.18)] bg-transparent text-[15px] text-[#0A1628] outline-none placeholder:text-[#6E7685]"
              />
              <span className="sr-only" aria-live="polite">
                {searchQuery.trim()
                  ? filteredSearchItems.length
                    ? `${filteredSearchItems.length} products found.`
                    : 'No products found.'
                  : ''}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (searchQuery) {
                    setSearchQuery('');
                    setActiveSearchIndex(-1);
                    searchInputRef.current?.focus();
                  } else {
                    closeSearch();
                  }
                }}
                className="text-[12px] text-[#0A1628] underline underline-offset-4"
              >
                {searchQuery ? 'clear' : 'close'}
              </button>
            </div>
          </div>
        ) : null}
        </div>
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
        <SmartNavLink
          href="/"
          onClick={closeMenu}
          className="block py-3.5 text-[20px] font-normal tracking-[0.04em] border-b border-black/[0.06] no-underline text-[#0A1628] transition-all duration-300 hover:text-[#0A1628] hover:pl-2"
          style={{ fontFamily: 'var(--display-title)' }}
        >
          Home
        </SmartNavLink>

        {navItems.map((item) => {
          const hasMega = Boolean(item.mega?.sections?.length);
          const isOpen = mobileOpenItem === item.label;

          if (!hasMega) {
            return (
              <SmartNavLink
                key={item.label}
                href={item.href ?? '#'}
                onClick={closeMenu}
                className="block py-3.5 text-[20px] font-normal tracking-[0.04em] border-b border-black/[0.06] no-underline text-[#0A1628] transition-all duration-300 hover:text-[#0A1628] hover:pl-2"
                style={{ fontFamily: 'var(--display-title)' }}
              >
                {item.label}
              </SmartNavLink>
            );
          }

          return (
            <div key={item.label} className="border-b border-black/[0.06]">
              <button
                type="button"
                onClick={() => {
                  if (isOpen && item.href) {
                    closeMenu();
                    router.push(item.href);
                    return;
                  }
                  setMobileOpenItem(item.label);
                }}
                className="flex w-full items-center justify-between py-3.5 text-left text-[20px] font-normal tracking-[0.04em] text-[#0A1628]"
                style={{ fontFamily: 'var(--display-title)' }}
              >
                <span>{item.label}</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
                  className="flex-shrink-0 transition-transform duration-300"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <path d="M4 7L9 12L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isOpen ? (
                <div className="pb-4">
                  {item.mega?.sections.map((section) => {
                    const entries = getMobileSectionEntries(section);
                    if (!entries.length) return null;

                    return (
                      <div key={`${item.label}-${section.id}`} className="pb-3 last:pb-0">
                        <div
                          className="flex items-center gap-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6A6A6A]"
                          style={{ fontFamily: 'var(--display-title)' }}
                        >
                          {section.iconUrl ? (
                            <img
                              src={section.iconUrl}
                              alt=""
                              aria-hidden="true"
                              className="h-4 w-4 flex-shrink-0 object-contain"
                            />
                          ) : null}
                          <span>{section.title}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          {entries.map((entry) => (
                            <SmartNavLink
                              key={`${section.id}-${entry.label}-${entry.href}`}
                              href={entry.href}
                              onClick={closeMenu}
                            className="flex items-center gap-3 rounded-xl px-2 py-2 text-[13px] font-light tracking-[0.02em] text-[#253246] no-underline transition-colors duration-200 hover:bg-black/[0.03] hover:text-[#0A1628]"
                              style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                              {entry.icon}
                              <span>{entry.label}</span>
                            </SmartNavLink>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}

        {[
          { label: 'Wishlist', href: '/wishlist' },
          { label: 'Cart', href: '/cart' },
          { label: 'About Us', href: '/about' },
          { label: 'Contact Us', href: '/contact' },
        ].map((item) => (
          <SmartNavLink
            key={item.label}
            href={item.href}
            onClick={closeMenu}
            className="block py-3.5 text-[20px] font-normal tracking-[0.04em] border-b border-black/[0.06] no-underline text-[#0A1628] transition-all duration-300 hover:text-[#0A1628] hover:pl-2"
            style={{ fontFamily: 'var(--display-title)' }}
          >
            {item.label}
          </SmartNavLink>
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
