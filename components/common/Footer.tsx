'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

const SOCIAL = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/houseofdiams',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23C21.85 8.4 21.85 8.8 21.85 12s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38a3.73 3.73 0 0 1-1.38.9c-.42.17-1.06.37-2.23.42-1.25.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.73 3.73 0 0 1-1.38-.9 3.73 3.73 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.2 15.6 2.15 15.2 2.15 12s0-3.6.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.14 0-3.51 0-4.74.07-1.06.05-1.64.22-2.02.37-.51.2-.87.44-1.25.82s-.62.74-.82 1.25c-.15.38-.32.96-.37 2.02C2.73 9.77 2.72 10.14 2.72 13.28s0 3.51.07 4.74c.05 1.06.22 1.64.37 2.02.2.51.44.87.82 1.25.38.38.74.62 1.25.82.38.15.96.32 2.02.37 1.23.06 1.6.07 4.74.07s3.51 0 4.74-.07c1.06-.05 1.64-.22 2.02-.37.51-.2.87-.44 1.25-.82.38-.38.62-.74.82-1.25.15-.38.32-.96.37-2.02.06-1.23.07-1.6.07-4.74s0-3.51-.07-4.74c-.05-1.06-.22-1.64-.37-2.02a3.35 3.35 0 0 0-.82-1.25 3.35 3.35 0 0 0-1.25-.82c-.38-.15-.96-.32-2.02-.37C15.51 4 15.14 4 12 4zM12 6.86a5.14 5.14 0 1 1 0 10.28 5.14 5.14 0 0 1 0-10.28zm0 8.48a3.34 3.34 0 1 0 0-6.68 3.34 3.34 0 0 0 0 6.68zm6.54-8.68a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/houseofdiams',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.09 5.66 21.25 10.44 22v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.77-1.63 1.57v1.88h2.78l-.45 2.91h-2.34V22C18.34 21.25 22 17.09 22 12.06z" />
      </svg>
    ),
  },
  {
    name: 'Pinterest',
    href: 'https://pinterest.com/houseofdiams',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.23 2.64 7.85 6.35 9.3-.09-.79-.17-2 .04-2.86.19-.78 1.21-4.97 1.21-4.97s-.31-.62-.31-1.53c0-1.43.83-2.5 1.87-2.5.88 0 1.31.66 1.31 1.45 0 .88-.56 2.2-.85 3.42-.24 1.02.51 1.86 1.52 1.86 1.83 0 3.23-1.93 3.23-4.71 0-2.46-1.77-4.18-4.29-4.18-2.93 0-4.64 2.19-4.64 4.46 0 .88.34 1.83.76 2.35.08.1.1.19.07.29-.08.34-.26 1.04-.3 1.19-.05.19-.15.23-.35.14-1.3-.61-2.11-2.5-2.11-4.02 0-3.27 2.38-6.28 6.86-6.28 3.6 0 6.4 2.57 6.4 6 0 3.58-2.25 6.46-5.39 6.46-1.05 0-2.04-.55-2.38-1.2 0 0-.52 1.99-.65 2.48-.24.91-.87 2.05-1.29 2.75.97.3 2 .46 3.07.46 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com/@houseofdiams',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.71a8.16 8.16 0 0 0 4.77 1.52V6.78a4.85 4.85 0 0 1-1.84-.09z" />
      </svg>
    ),
  },
];

type FooterCategory = {
  id: string;
  name: string;
  slug: string;
};

function ColLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group block py-[7px] text-[11px] font-light tracking-[0.08em] text-[var(--theme-muted)] no-underline transition-all duration-300 hover:text-white hover:pl-1.5"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {children}
    </a>
  );
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="m-0 mb-[22px] text-[14px] font-medium uppercase tracking-[0.28em] text-white"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
    >
      {children}
    </p>
  );
}

function BottomLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-[var(--theme-muted)] no-underline transition-colors duration-300 hover:text-white">
      {children}
    </a>
  );
}

export default function Footer() {
  const [serviceCategories, setServiceCategories] = useState<FooterCategory[]>([]);

  useEffect(() => {
    let ignore = false;

    const loadCategories = async () => {
      const { data, error } = await supabase
        .from('catalog_categories')
        .select('id, name, slug')
        .eq('status', 'active')
        .order('display_order', { ascending: true });

      if (ignore || error || !data) return;
      setServiceCategories(data);
    };

    void loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleServiceCategories = useMemo(() => serviceCategories.filter((item) => item.slug && item.name), [serviceCategories]);

  return (
    <footer
      className="relative px-5 pt-20 sm:px-7 lg:px-[52px]"
      style={{ background: 'var(--theme-ink)', color: 'rgba(255,255,255,0.72)', fontFamily: "'Montserrat', sans-serif" }}
    >
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)' }}
      />

      <div
        className="hod-footer-grid mx-auto max-w-[1400px] pb-[60px]"
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr', gap: '48px' }}
      >
        <style>{`
          @media (max-width: 1024px) {
            .hod-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
          }
          @media (max-width: 640px) {
            .hod-footer-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <div>
          <p
            className="m-0 mb-[18px] text-[26px] font-normal uppercase tracking-[0.24em] text-white"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            House of Diams
          </p>

          <p className="m-0 mb-[26px] max-w-[320px] text-[11px] font-light leading-[1.9] tracking-[0.04em] text-[rgba(255,255,255,0.68)]">
            Fine jewellery with natural and CVD diamonds, crafted in Surat, India - the diamond capital of the world. Ethically sourced. Globally trusted.
          </p>

          <div className="mt-2 flex gap-[10px]">
            {SOCIAL.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.name}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[var(--theme-ink)]"
                style={{ border: '1px solid rgba(255,255,255,0.24)' }}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <ColTitle>Navigate</ColTitle>
          <ColLink href="/">Home</ColLink>
          <ColLink href="/shop">Shop</ColLink>
          <ColLink href="/about">About Us</ColLink>
          <ColLink href="/bespoke">Bespoke</ColLink>
          <ColLink href="/contact">Contact</ColLink>
        </div>

        <div>
          <ColTitle>Services</ColTitle>
          {visibleServiceCategories.length > 0 ? (
            visibleServiceCategories.map((category) => (
              <ColLink key={category.id} href={`/shop?category=${encodeURIComponent(category.slug)}`}>
                {category.name}
              </ColLink>
            ))
          ) : (
            <ColLink href="/shop">Shop Collection</ColLink>
          )}
        </div>

        <div>
          <ColTitle>Support</ColTitle>
          <ColLink href="/shipping">Shipping</ColLink>
          <ColLink href="/returns">Returns</ColLink>
          <ColLink href="/terms">Terms &amp; Conditions</ColLink>
          <ColLink href="/privacy-policy">Privacy Policy</ColLink>
        </div>

        <div>
          <ColTitle>Contact</ColTitle>
          <ColLink href="mailto:info@houseofdiams.com">info@houseofdiams.com</ColLink>
          <ColLink href="tel:+919328536178">+91 93285 36178</ColLink>
          <ColLink href="#">Surat, Gujarat, India</ColLink>
        </div>
      </div>

      <div
        className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-3.5 py-7 text-[10px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.5)]"
        style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
      >
        <span>© 2025 House of Diams. All rights reserved.</span>
        <div className="flex items-center gap-0">
          <BottomLink href="/privacy-policy">Privacy</BottomLink>
          <span className="mx-2">·</span>
          <BottomLink href="/terms">Terms</BottomLink>
          <span className="mx-2">·</span>
          <span>Fine Jewellery · Surat, India</span>
        </div>
      </div>
    </footer>
  );
}
