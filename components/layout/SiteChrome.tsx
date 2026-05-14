'use client';

import type { ReactNode } from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import FloatingWidgets from '@/components/home/FloatingWidgets';
import Loader from '@/components/home/Loader';
import { HomeLoaderProvider } from '@/components/layout/HomeLoaderContext';
import PromotionPopup from '@/components/layout/PromotionPopup';
import { shouldSkipHomeLoader } from '@/lib/home-loader-cache';

const AUTH_ROUTES = new Set(['/login', '/signup']);
const OVERLAY_NAVBAR_ROUTES = new Set(['/', '/hiphop', '/bespoke']);

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomeRoute = pathname === '/';
  const [isHomeLoading, setIsHomeLoading] = useState(isHomeRoute);
  const [isHomeReady, setIsHomeReady] = useState(!isHomeRoute);
  const usesDesktopOverlayNavbar = pathname ? OVERLAY_NAVBAR_ROUTES.has(pathname) : false;
  const isMinimalChromeRoute = pathname
    ? AUTH_ROUTES.has(pathname) || pathname.startsWith('/checkout')
    : false;

  useLayoutEffect(() => {
    if (isHomeRoute) {
      const skipLoader = shouldSkipHomeLoader();
      setIsHomeLoading(!skipLoader);
      setIsHomeReady(skipLoader);
    } else {
      setIsHomeLoading(false);
      setIsHomeReady(true);
    }
  }, [isHomeRoute]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.body.classList.toggle('home-loader-active', isHomeRoute && isHomeLoading);
    return () => {
      document.body.classList.remove('home-loader-active');
    };
  }, [isHomeLoading, isHomeRoute]);

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
    if (!isHomeRoute || !isHomeLoading || !isHomeReady) return;

    const fallbackTimer = window.setTimeout(() => {
      setIsHomeLoading(false);
    }, 1800);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, [isHomeLoading, isHomeReady, isHomeRoute]);

  return (
    <HomeLoaderProvider value={{ isHomeLoading, setIsHomeLoading, isHomeReady, setIsHomeReady }}>
      {isMinimalChromeRoute ? (
        <main className="flex-1">{children}</main>
      ) : (
        <>
          <div
            id="site-navbar-shell"
            className={isHomeLoading ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}
          >
            <Navbar />
          </div>
          <main className={`flex-1 ${usesDesktopOverlayNavbar ? 'pt-[91px] lg:pt-0' : 'pt-[118px] lg:pt-[146px]'}`}>{children}</main>
          <div
            id="site-footer-shell"
            className={isHomeLoading ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}
          >
            <Footer />
          </div>
          <PromotionPopup />
          {!isHomeLoading ? <FloatingWidgets /> : null}
          {isHomeRoute && isHomeLoading ? (
            <Loader ready={isHomeReady} onComplete={() => setIsHomeLoading(false)} />
          ) : null}
        </>
      )}
    </HomeLoaderProvider>
  );
}
