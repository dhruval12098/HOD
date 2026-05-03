'use client';

import type { ReactNode } from 'react';
import { useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import FloatingWidgets from '@/components/home/FloatingWidgets';
import Loader from '@/components/home/Loader';
import { HomeLoaderProvider } from '@/components/layout/HomeLoaderContext';
import PromotionPopup from '@/components/layout/PromotionPopup';

const AUTH_ROUTES = new Set(['/login', '/signup']);
const OVERLAY_NAVBAR_ROUTES = new Set(['/', '/hiphop', '/bespoke']);

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isHomeLoading, setIsHomeLoading] = useState(pathname === '/');
  const [isHomeReady, setIsHomeReady] = useState(pathname !== '/');
  const usesDesktopOverlayNavbar = pathname ? OVERLAY_NAVBAR_ROUTES.has(pathname) : false;
  const isMinimalChromeRoute = pathname
    ? AUTH_ROUTES.has(pathname) || pathname.startsWith('/checkout')
    : false;

  useLayoutEffect(() => {
    if (pathname === '/') {
      setIsHomeLoading(true);
      setIsHomeReady(false);
    } else {
      setIsHomeLoading(false);
      setIsHomeReady(true);
    }
  }, [pathname]);

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
          <main className={`flex-1 ${usesDesktopOverlayNavbar ? 'pt-[99px] lg:pt-[35px]' : 'pt-[146px]'}`}>{children}</main>
          <div
            id="site-footer-shell"
            className={isHomeLoading ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}
          >
            <Footer />
          </div>
          <PromotionPopup />
          {!isHomeLoading ? <FloatingWidgets /> : null}
          {pathname === '/' && isHomeLoading ? (
            <Loader ready={isHomeReady} onComplete={() => setIsHomeLoading(false)} />
          ) : null}
        </>
      )}
    </HomeLoaderProvider>
  );
}
