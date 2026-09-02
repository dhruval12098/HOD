'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import Navbar from '@/components/common/Navbar';
import Loader from '@/components/home/Loader';
import ViewportDeferred from '@/components/home/ViewportDeferred';
import { HomeLoaderProvider } from '@/components/layout/HomeLoaderContext';
import { shouldSkipHomeLoader } from '@/lib/home-loader-cache';
import type { NavbarRenderItem } from '@/lib/navbar';

const Footer = dynamic(() => import('@/components/common/Footer'), { loading: () => null });
const FloatingWidgets = dynamic(() => import('@/components/home/FloatingWidgets'), { loading: () => null });
const PromotionPopup = dynamic(() => import('@/components/layout/PromotionPopup'), { loading: () => null });

const AUTH_ROUTES = new Set(['/login', '/signup']);
const OVERLAY_NAVBAR_ROUTES = new Set(['/', '/hiphop', '/bespoke']);

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomeRoute = pathname === '/';
  const [isHomeLoading, setIsHomeLoading] = useState(isHomeRoute);
  const [isHomeLoaderExiting, setIsHomeLoaderExiting] = useState(false);
  const [isHomeReady, setIsHomeReady] = useState(!isHomeRoute);
  const [isNavbarReady, setIsNavbarReady] = useState(false);
  const [navItems, setNavItems] = useState<NavbarRenderItem[]>([]);
  const [showNonCriticalChrome, setShowNonCriticalChrome] = useState(false);
  const usesDesktopOverlayNavbar = pathname ? OVERLAY_NAVBAR_ROUTES.has(pathname) : false;
  const isMinimalChromeRoute = pathname
    ? AUTH_ROUTES.has(pathname) || pathname.startsWith('/checkout')
    : false;

  useEffect(() => {
    let ignore = false;
    void fetch('/api/public/navbar')
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (!ignore && ok && Array.isArray(payload?.items)) setNavItems(payload.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setIsNavbarReady(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const reveal = () => setShowNonCriticalChrome(true);
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(reveal, { timeout: 2000 });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }
    const timeoutId = window.setTimeout(reveal, 1200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useLayoutEffect(() => {
    if (isHomeRoute) {
      const skipLoader = shouldSkipHomeLoader();
      setIsHomeLoading(!skipLoader);
      setIsHomeLoaderExiting(false);
      setIsHomeReady(skipLoader);
    } else {
      setIsHomeLoading(false);
      setIsHomeLoaderExiting(false);
      setIsHomeReady(true);
    }
  }, [isHomeRoute]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.body.classList.toggle('home-loader-active', isHomeRoute && isHomeLoading && !isHomeLoaderExiting);
    return () => {
      document.body.classList.remove('home-loader-active');
    };
  }, [isHomeLoaderExiting, isHomeLoading, isHomeRoute]);

  useEffect(() => {
    if (!isHomeRoute) return;

    const restoreHomeChrome = (persisted = false) => {
      const navigationEntries =
        typeof performance !== 'undefined'
          ? performance.getEntriesByType('navigation')
          : [];
      const navigationType =
        navigationEntries[0] && 'type' in navigationEntries[0]
          ? (navigationEntries[0] as PerformanceNavigationTiming).type
          : '';

      if (persisted || navigationType === 'back_forward' || shouldSkipHomeLoader()) {
        setIsHomeReady(true);
        setIsHomeLoading(false);
        setIsHomeLoaderExiting(false);
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      restoreHomeChrome(event.persisted);
    };

    const handlePopState = () => {
      restoreHomeChrome(false);
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isHomeRoute]);

  useEffect(() => {
    if (!isHomeRoute || !isHomeLoading || !isHomeReady || !isNavbarReady) return;

    const fallbackTimer = window.setTimeout(() => {
      setIsHomeLoading(false);
      setIsHomeLoaderExiting(false);
    }, 1800);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, [isHomeLoading, isHomeReady, isHomeRoute, isNavbarReady]);

  const handleHomeLoaderComplete = useCallback(() => {
    setIsHomeLoading(false);
    setIsHomeLoaderExiting(false);
  }, []);

  const handleHomeLoaderExitStart = useCallback(() => {
    setIsHomeLoaderExiting(true);
  }, []);

  const hideHomeChrome = isHomeLoading && !isHomeLoaderExiting;

  return (
    <HomeLoaderProvider value={{ isHomeLoading, setIsHomeLoading, isHomeReady, setIsHomeReady }}>
      <NextTopLoader
        color="#B8924A"
        height={3}
        showSpinner={false}
        crawl
        speed={240}
        crawlSpeed={180}
        initialPosition={0.12}
        shadow="0 0 10px rgba(184, 146, 74, 0.45), 0 0 4px rgba(184, 146, 74, 0.3)"
        zIndex={12000}
      />
      {isMinimalChromeRoute ? (
        <main className="flex-1">{children}</main>
      ) : (
        <>
          <div
            id="site-navbar-shell"
            className={`transition-opacity duration-500 ease-out ${hideHomeChrome ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}`}
          >
            <Navbar navItems={navItems} />
          </div>
          <main className={`flex-1 ${usesDesktopOverlayNavbar ? 'pt-[91px] lg:pt-0' : 'pt-[118px] lg:pt-[146px]'}`}>{children}</main>
          <div
            id="site-footer-shell"
            className={`transition-opacity duration-500 ease-out ${hideHomeChrome ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}`}
          >
            <ViewportDeferred minHeight={520}>
              <Footer navItems={navItems} />
            </ViewportDeferred>
          </div>
          {showNonCriticalChrome ? <PromotionPopup /> : null}
          {showNonCriticalChrome ? (
            <div className={`transition-opacity duration-500 ease-out ${hideHomeChrome ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}`}>
              <FloatingWidgets />
            </div>
          ) : null}
          {isHomeRoute && isHomeLoading ? (
            <Loader
              ready={isHomeReady && isNavbarReady}
              minDurationMs={0}
              onExitStart={handleHomeLoaderExitStart}
              onComplete={handleHomeLoaderComplete}
            />
          ) : null}
        </>
      )}
    </HomeLoaderProvider>
  );
}
