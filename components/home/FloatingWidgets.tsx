'use client';

import { useEffect, useState } from 'react';

export default function FloatingWidgets() {
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
          borderRadius: '50%',
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
          el.style.background = 'var(--gold)';
          el.style.borderColor = 'var(--gold)';
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

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/919328536178?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20House%20of%20Diams"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#25D366',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          textDecoration: 'none',
          boxShadow: '0 8px 24px rgba(37,211,102,0.4)',
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.08)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" fill="currentColor">
          <path d="M19.1 15.4c-.3-.2-1.8-.9-2.1-1s-.5-.1-.7.2l-1 1.2c-.2.2-.4.3-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.6-1.8-1.7-2.1-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.5s.1-.3 0-.5c0-.2-.7-1.6-1-2.2-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.2 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4s.3-1.3.2-1.4c-.1-.2-.3-.3-.6-.5zM13.1 3A10 10 0 003 13a10 10 0 001.5 5.2L3 24l5.9-1.5A10 10 0 1013.1 3z" />
        </svg>
      </a>
    </>
  );
}
