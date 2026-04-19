'use client';

import { useEffect, useRef } from 'react';

function RevealDiv({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          entries[0].target.classList.add('opacity-100', 'translate-y-0');
          entries[0].target.classList.remove('opacity-0', 'translate-y-6');
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px' }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-6 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function ContactMap() {
  return (
    <RevealDiv className="mx-[52px] mb-20 max-lg:mx-7 max-md:mx-5 max-md:mb-12">
      <div
        className="h-[320px] relative overflow-hidden border border-[rgba(20,18,13,0.10)]"
        style={{
          background: 'linear-gradient(135deg, #F6F2EA 0%, #EEE7DA 100%)',
        }}
      >
        {/* Gold grid background */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(184,146,42,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(184,146,42,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Centered pin + label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          {/* Animated pin */}
          <div className="relative w-12 h-12 mx-auto mb-4">
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-full bg-[rgba(184,146,42,0.2)] animate-ping"
              style={{ animationDuration: '2s' }}
            />
            {/* Pin shape: rounded top + pointed bottom via rotation trick */}
            <div
              className="absolute inset-0 bg-[#B8922A] shadow-[0_8px_20px_rgba(184,146,42,0.4)] animate-[mapPinPulse_2s_ease-in-out_infinite]"
              style={{
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
              }}
            >
              {/* Inner white dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>

          {/* Label */}
          <div className="font-serif text-[22px] font-normal text-[#14120D] mb-1 tracking-[0.02em]">
            House of Diams Atelier
          </div>
          <div className="text-[10px] tracking-[0.24em] text-[#7A7060] uppercase">
            Surat · Gujarat · India
          </div>
        </div>
      </div>
    </RevealDiv>
  );
}
