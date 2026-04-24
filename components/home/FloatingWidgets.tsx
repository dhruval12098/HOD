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
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M16.03 4.8C9.92 4.8 4.97 9.75 4.97 15.86c0 1.95.5 3.85 1.46 5.53L4.8 27.2l5.96-1.56a11 11 0 0 0 5.27 1.34h.01c6.1 0 11.05-4.95 11.05-11.06A11.03 11.03 0 0 0 16.03 4.8Z"
            fill="currentColor"
          />
          <path
            d="M16.03 6.55c5.13 0 9.3 4.17 9.3 9.3 0 5.13-4.17 9.3-9.29 9.3-1.64 0-3.25-.43-4.67-1.24l-.33-.19-3.54.93.95-3.45-.21-.35a9.22 9.22 0 0 1-1.42-4.99c0-5.13 4.17-9.3 9.21-9.3Z"
            fill="#25D366"
          />
          <path
            d="M12.02 10.82c-.2 0-.41.01-.58.18-.2.2-.78.76-.78 1.84 0 1.09.8 2.13.92 2.27.11.15 1.56 2.5 3.85 3.4 1.9.75 2.29.6 2.7.56.42-.04 1.36-.56 1.55-1.11.19-.55.19-1.02.13-1.11-.05-.09-.19-.14-.4-.25-.2-.11-1.2-.59-1.39-.66-.19-.07-.33-.11-.47.11-.14.2-.54.66-.66.8-.12.14-.25.16-.46.05-.21-.11-.9-.33-1.71-1.05-.63-.56-1.06-1.26-1.18-1.47-.12-.2-.01-.32.09-.43.09-.09.2-.25.3-.37.1-.12.14-.2.21-.34.07-.14.04-.26-.02-.36-.05-.11-.47-1.28-.66-1.74-.16-.41-.33-.42-.47-.42h-.4Z"
            fill="white"
          />
        </svg>
      </a>
    </>
  );
}
