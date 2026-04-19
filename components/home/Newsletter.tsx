'use client';

import { useState } from 'react';

interface NewsletterProps {
  onToast?: (msg: string) => void;
}

export default function Newsletter({ onToast }: NewsletterProps) {
  const [email, setEmail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmail('');
    onToast?.('✓ Welcome to the inner circle');
  }

  return (
    <section
      className="reveal"
      style={{
        padding: '90px 52px',
        margin: '0 52px 110px',
        background: 'linear-gradient(135deg, var(--gold-soft) 0%, var(--bg2) 100%)',
        border: '1px solid var(--border-gold)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--sans)',
      }}
    >
      {/* Radial glows */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 20%, rgba(184,146,42,0.1), transparent 40%), radial-gradient(circle at 80% 80%, rgba(184,146,42,0.08), transparent 40%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '560px', margin: '0 auto' }}>
        {/* Eyebrow */}
        <div
          style={{
            fontSize: '10px',
            fontWeight: 400,
            letterSpacing: '0.32em',
            color: 'var(--gold)',
            textTransform: 'uppercase',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <span style={{ width: '24px', height: '1px', background: 'var(--gold)', display: 'inline-block' }} />
          The Inner Circle
        </div>

        {/* Headline */}
        <h3
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(34px, 4vw, 52px)',
            fontWeight: 300,
            color: 'var(--ink)',
            marginBottom: '16px',
            letterSpacing: '0.01em',
            lineHeight: 1.1,
          }}
        >
          Receive{' '}
          <em style={{ fontStyle: 'normal', color: 'var(--gold)' }}>New Drops First</em>
        </h3>

        <p
          style={{
            fontSize: '12px',
            fontWeight: 300,
            letterSpacing: '0.08em',
            color: 'var(--ink3)',
            marginBottom: '32px',
            lineHeight: 1.8,
          }}
        >
          Join our private list for exclusive previews, bespoke releases and jeweller&apos;s notes from the Surat workshop.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            maxWidth: '440px',
            margin: '0 auto',
            background: '#fff',
            border: '1px solid var(--border)',
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            aria-label="Email address"
            style={{
              flex: 1,
              padding: '16px 20px',
              border: 'none',
              fontFamily: 'var(--sans)',
              fontSize: '12px',
              background: 'transparent',
              color: 'var(--ink)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '14px 24px',
              background: 'var(--ink)',
              color: 'var(--bg)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '10px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              fontFamily: 'var(--sans)',
              transition: 'background 0.3s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--gold)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--ink)')}
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
