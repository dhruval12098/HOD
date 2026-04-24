'use client';

import { useState, useEffect, useRef } from 'react';

function RevealDiv({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
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
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

type ConfigRow = {
  id?: string;
  label: string;
  display_order?: number;
};

type FormConfigPayload = {
  settings?: {
    intro_heading?: string | null;
    intro_subtitle?: string | null;
    footer_note?: string | null;
  } | null;
  guarantees?: ConfigRow[];
  pieceTypes?: ConfigRow[];
  stoneOptions?: ConfigRow[];
  caratOptions?: ConfigRow[];
  metalOptions?: ConfigRow[];
};

type FormConfigState = {
  settings: {
    intro_heading: string;
    intro_subtitle: string;
    footer_note: string;
  };
  guarantees: ConfigRow[];
  pieceTypes: ConfigRow[];
  stoneOptions: ConfigRow[];
  caratOptions: ConfigRow[];
  metalOptions: ConfigRow[];
};

const fallbackConfig: FormConfigState = {
  settings: {
    intro_heading: 'Configure Your Bespoke Order',
    intro_subtitle:
      'Every bespoke commission begins with a conversation. Share your vision below and our team will be in touch within 24 hours with next steps.',
    footer_note: "We'll reply within 24 hours. Your details stay confidential.",
  },
  guarantees: [
    { label: 'Free design consultation · no obligation' },
    { label: 'CAD rendering provided before production' },
    { label: 'Full IGI / GIA certification included' },
    { label: 'Insured worldwide shipping complimentary' },
    { label: '4–8 week typical lead time' },
  ],
  pieceTypes: [
    { label: 'Engagement Ring' },
    { label: 'Wedding Band' },
    { label: 'Tennis Bracelet' },
    { label: 'Necklace / Pendant' },
    { label: 'Earrings' },
    { label: 'Hip Hop Chain' },
    { label: 'Loose Diamond' },
    { label: 'Other' },
  ],
  stoneOptions: [
    { label: 'Natural Diamond' },
    { label: 'CVD Colourless Diamond' },
    { label: 'CVD Fancy Colour Diamond' },
    { label: 'Natural Ruby' },
    { label: 'Natural Emerald' },
    { label: 'Natural Sapphire' },
    { label: 'Need Recommendation' },
  ],
  caratOptions: [
    { label: 'Under 0.5 ct' },
    { label: '0.5 – 1.0 ct' },
    { label: '1.0 – 2.0 ct' },
    { label: '2.0 – 5.0 ct' },
    { label: '5.0 ct+' },
  ],
  metalOptions: [
    { label: '18K Yellow Gold' },
    { label: '18K White Gold' },
    { label: '18K Rose Gold' },
    { label: '14K Gold' },
    { label: 'Platinum' },
    { label: '925 Silver' },
    { label: 'Not Sure' },
  ],
};

const selectClasses =
  'w-full px-4 py-3.5 font-sans text-[13px] font-light text-[#0A1628] bg-[#FAFBFD] border border-[rgba(10,22,40,0.10)] transition-all duration-300 focus:outline-none focus:border-[#0A1628] focus:bg-white appearance-none pr-10';
const inputClasses =
  'w-full px-4 py-3.5 font-sans text-[13px] font-light text-[#0A1628] bg-[#FAFBFD] border border-[rgba(10,22,40,0.10)] transition-all duration-300 focus:outline-none focus:border-[#0A1628] focus:bg-white';

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23B8922A' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 16px center',
};

interface BespokeFormProps {
  onSuccess?: () => void;
}

export default function BespokeForm({ onSuccess }: BespokeFormProps) {
  const [config, setConfig] = useState<FormConfigState>(fallbackConfig);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    piece: '',
    stone: '',
    carat: '',
    metal: '',
    message: '',
  });

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch('/api/public/bespoke/form-config', { cache: 'no-store' });
        const payload = await response.json();
        if (!active) return;
        setConfig({
          settings: {
            intro_heading: payload?.settings?.intro_heading ?? fallbackConfig.settings.intro_heading,
            intro_subtitle: payload?.settings?.intro_subtitle ?? fallbackConfig.settings.intro_subtitle,
            footer_note: payload?.settings?.footer_note ?? fallbackConfig.settings.footer_note,
          },
          guarantees: Array.isArray(payload?.guarantees) && payload.guarantees.length ? payload.guarantees : fallbackConfig.guarantees,
          pieceTypes: Array.isArray(payload?.pieceTypes) && payload.pieceTypes.length ? payload.pieceTypes : fallbackConfig.pieceTypes,
          stoneOptions: Array.isArray(payload?.stoneOptions) && payload.stoneOptions.length ? payload.stoneOptions : fallbackConfig.stoneOptions,
          caratOptions: Array.isArray(payload?.caratOptions) && payload.caratOptions.length ? payload.caratOptions : fallbackConfig.caratOptions,
          metalOptions: Array.isArray(payload?.metalOptions) && payload.metalOptions.length ? payload.metalOptions : fallbackConfig.metalOptions,
        });
      } catch {
        if (active) setConfig(fallbackConfig);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/public/bespoke/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          full_name: form.name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          piece_type: form.piece,
          stone_preference: form.stone,
          approx_carat: form.carat,
          preferred_metal: form.metal,
          message: form.message,
        }),
      });

      if (!response.ok) {
        throw new Error((await response.json().catch(() => null))?.error ?? 'Unable to submit enquiry.');
      }

      const text = [
        'Hi, new bespoke enquiry from the website:',
        '',
        `Name: ${form.name}`,
        `Email: ${form.email}`,
        `Phone: ${form.phone}`,
        `Country: ${form.country}`,
        `Piece Type: ${form.piece}`,
        `Stone: ${form.stone}`,
        `Approx. Carat: ${form.carat}`,
        `Metal: ${form.metal}`,
        `Vision: ${form.message}`,
      ].join('\n');
      window.open(`https://wa.me/919328536178?text=${encodeURIComponent(text)}`, '_blank');
      onSuccess?.();
      setForm({ name: '', email: '', phone: '', country: '', piece: '', stone: '', carat: '', metal: '', message: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="bespoke-form"
      className="py-[110px] px-[52px] max-lg:px-7 max-md:px-5 max-md:py-[70px]"
      style={{ background: 'linear-gradient(180deg, #FAFBFD 0%, #FAF7F2 100%)' }}
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-[1fr_1.3fr] gap-20 items-start max-lg:grid-cols-1 max-lg:gap-10">
        <RevealDiv>
          <div className="w-[60px] h-px bg-[#0A1628] mb-6" />
          <div className="text-[10px] font-normal tracking-[0.32em] text-[#0A1628] uppercase mb-3.5 inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#0A1628]">
            Start Your Piece
          </div>
          <h2
            className="font-serif font-light tracking-[0.02em] text-[#0A1628] leading-[1.1] mb-5"
            style={{ fontSize: '48px' }}
          >
            {config.settings.intro_heading || 'Configure Your Bespoke Order'}
          </h2>
          <p className="text-[12px] font-light leading-[2] text-[#6A6A6A] tracking-[0.04em] mb-8">
            {config.settings.intro_subtitle}
          </p>

          <div className="flex flex-col gap-3.5">
            {config.guarantees.map((item, i) => (
              <div key={item.id ?? i} className="flex items-start gap-3.5 text-[11px] font-light leading-[1.6] text-[#253246] tracking-[0.04em]">
                <span className="w-1.5 h-1.5 bg-[#0A1628] rounded-full mt-[7px] flex-shrink-0" />
                {item.label}
              </div>
            ))}
          </div>
        </RevealDiv>

        <RevealDiv delay={100}>
          <div className="bg-white px-11 py-11 border border-[rgba(10,22,40,0.10)] max-md:px-[22px] max-md:py-7">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#6A6A6A] uppercase mb-2" htmlFor="b-name">
                    Full Name
                  </label>
                  <input id="b-name" type="text" required value={form.name} onChange={set('name')} className={inputClasses} />
                </div>

                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#6A6A6A] uppercase mb-2" htmlFor="b-email">
                    Email
                  </label>
                  <input id="b-email" type="email" required value={form.email} onChange={set('email')} className={inputClasses} />
                </div>

                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#6A6A6A] uppercase mb-2" htmlFor="b-phone">
                    Phone / WhatsApp
                  </label>
                  <input id="b-phone" type="tel" value={form.phone} onChange={set('phone')} className={inputClasses} />
                </div>

                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#6A6A6A] uppercase mb-2" htmlFor="b-country">
                    Country
                  </label>
                  <input id="b-country" type="text" required value={form.country} onChange={set('country')} className={inputClasses} />
                </div>

                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#6A6A6A] uppercase mb-2" htmlFor="b-piece">
                    Piece Type
                  </label>
                  <select id="b-piece" required value={form.piece} onChange={set('piece')} className={selectClasses} style={selectStyle}>
                    <option value="">Select piece…</option>
                    {config.pieceTypes.map((item) => (
                      <option key={item.id ?? item.label} value={item.label}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#6A6A6A] uppercase mb-2" htmlFor="b-stone">
                    Preferred Stone
                  </label>
                  <select id="b-stone" value={form.stone} onChange={set('stone')} className={selectClasses} style={selectStyle}>
                    <option value="">Stone preference…</option>
                    {config.stoneOptions.map((item) => (
                      <option key={item.id ?? item.label} value={item.label}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#6A6A6A] uppercase mb-2" htmlFor="b-carat">
                    Approx. Carat
                  </label>
                  <select id="b-carat" value={form.carat} onChange={set('carat')} className={selectClasses} style={selectStyle}>
                    <option value="">Select size…</option>
                    {config.caratOptions.map((item) => (
                      <option key={item.id ?? item.label} value={item.label}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#6A6A6A] uppercase mb-2" htmlFor="b-metal">
                    Preferred Metal
                  </label>
                  <select id="b-metal" value={form.metal} onChange={set('metal')} className={selectClasses} style={selectStyle}>
                    <option value="">Select metal…</option>
                    {config.metalOptions.map((item) => (
                      <option key={item.id ?? item.label} value={item.label}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 max-md:col-span-1">
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#6A6A6A] uppercase mb-2" htmlFor="b-message">
                    Describe Your Vision
                  </label>
                  <textarea
                    id="b-message"
                    rows={4}
                    required
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Design ideas, inspiration, occasion, budget range, timeline…"
                    className="w-full px-4 py-3.5 font-sans text-[13px] font-light text-[#0A1628] bg-[#FAFBFD] border border-[rgba(10,22,40,0.10)] transition-all duration-300 focus:outline-none focus:border-[#0A1628] focus:bg-white resize-y min-h-[100px] tracking-[0.02em]"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-5 pt-6 border-t border-[rgba(10,22,40,0.10)] flex-wrap gap-4">
                <p className="text-[10px] text-[#6A6A6A] tracking-[0.04em]">
                  {config.settings.footer_note}
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#FAFBFD] bg-[#0A1628] px-[34px] py-4 border-none cursor-pointer uppercase relative overflow-hidden group transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(10,22,40,0.18)]"
                >
                  <span className="absolute inset-0 bg-[#0A1628] z-0 translate-y-full group-hover:translate-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.77,0,0.18,1)]" />
                  <span className="relative z-10">{submitting ? 'Submitting...' : 'Submit Enquiry'}</span>
                </button>
              </div>
            </form>
          </div>
        </RevealDiv>
      </div>
    </section>
  );
}
