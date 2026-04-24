'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import FloatingWidgets from '@/components/home/FloatingWidgets';
import Loader from '@/components/home/Loader';
import { HomeLoaderProvider } from '@/components/layout/HomeLoaderContext';
import PromotionPopup from '@/components/layout/PromotionPopup';

const AUTH_ROUTES = new Set(['/login', '/signup']);

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isHomeLoading, setIsHomeLoading] = useState(pathname === '/');
  const isMinimalChromeRoute = pathname
    ? AUTH_ROUTES.has(pathname) || pathname.startsWith('/checkout')
    : false;

  useEffect(() => {
    if (pathname === '/') {
      setIsHomeLoading(true);
    } else {
      setIsHomeLoading(false);
    }
  }, [pathname]);

  if (isMinimalChromeRoute) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <HomeLoaderProvider value={{ isHomeLoading, setIsHomeLoading }}>
      <>
        <div
          id="site-navbar-shell"
          className={isHomeLoading ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}
        >
          <Navbar />
        </div>
        <main className="flex-1 pt-[146px]">{children}</main>
        <div
          id="site-footer-shell"
          className={isHomeLoading ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}
        >
          <Footer />
        </div>
        {!isMinimalChromeRoute ? <PromotionPopup /> : null}
        {!isHomeLoading ? <FloatingWidgets /> : null}
        {pathname === '/' && isHomeLoading ? <Loader ready onComplete={() => setIsHomeLoading(false)} /> : null}
      </>
    </HomeLoaderProvider>
  );
}
