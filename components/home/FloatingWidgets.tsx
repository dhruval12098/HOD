'use client';

import { useEffect, useState } from 'react';

const fallbackWhatsappNumber = '919328536178';

function buildWhatsappHref(number: string) {
  const digits = number.replace(/[^\d]/g, '') || fallbackWhatsappNumber;
  return `https://wa.me/${digits}?text=${encodeURIComponent("Hi, I'd like to enquire about House of Diams")}`;
}

export default function FloatingWidgets() {
  const [showBackTop, setShowBackTop] = useState(false);
  const [whatsappHref, setWhatsappHref] = useState(buildWhatsappHref(fallbackWhatsappNumber));

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/public/settings');
        const payload = await response.json().catch(() => null);
        if (!response.ok || ignore) return;

        const nextNumber = typeof payload?.item?.whatsapp_number === 'string'
          ? payload.item.whatsapp_number
          : fallbackWhatsappNumber;

        setWhatsappHref(buildWhatsappHref(nextNumber));
      } catch {}
    };

    void loadSettings();
    return () => {
      ignore = true;
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '90px',
          width: '52px',
          height: '52px',
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          opacity: showBackTop ? 1 : 0,
          visibility: showBackTop ? 'visible' : 'hidden',
          transition: 'all 0.4s',
          background: 'var(--ink)',
          color: 'var(--bg)',
          border: '1px solid var(--ink)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.background = 'var(--theme-ink)';
          el.style.borderColor = 'var(--theme-ink)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.background = 'var(--ink)';
          el.style.borderColor = 'var(--ink)';
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 13V1M1 7L7 1L13 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Chat FAB */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '70px',
          height: '50px',
          borderRadius: 999,
          background: '#1d1e22',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          textDecoration: 'none',
          boxShadow: '0 12px 30px rgba(0,0,0,0.28)',
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.08)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
      >
        <img src="/Navbar svgs/chat-circle.svg" alt="" aria-hidden="true" style={{ width: '32px', height: '32px', filter: 'invert(1)', opacity: 0.95 }} />
      </a>
    </>
  );
}
