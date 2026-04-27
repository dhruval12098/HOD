'use client';

import { useState, useEffect, useRef } from 'react';
import { Select } from '@/components/ui/select';

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
    { label: '4-8 week typical lead time' },
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
    { label: '0.5 - 1.0 ct' },
    { label: '1.0 - 2.0 ct' },
    { label: '2.0 - 5.0 ct' },
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

const inputClasses =
  'w-full px-4 py-3.5 font-sans text-[13px] font-light text-[#0A1628] bg-[#FAFBFD] border border-[rgba(10,22,40,0.10)] transition-all duration-300 focus:outline-none focus:border-[#0A1628] focus:bg-white';

interface BespokeFormProps {
  onSuccess?: () => void;
}

export default function BespokeForm({ onSuccess, initialConfig }: BespokeFormProps & { initialConfig?: FormConfigState }) {
  const [config, setConfig] = useState<FormConfigState>(initialConfig ?? fallbackConfig);
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

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const setDropdown = (field: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    if (initialConfig) return;
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
  }, [initialConfig]);

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
          <div className="mb-6 h-px w-[60px] bg-[#0A1628]" />
          <div className="mb-3.5 inline-flex items-center gap-3 text-[10px] font-normal uppercase tracking-[0.32em] text-[#0A1628] before:h-px before:w-6 before:bg-[#0A1628] before:content-['']">
            Start Your Piece
          </div>
          <h2 className="mb-5 font-serif text-[#0A1628]" style={{ fontSize: '48px', fontWeight: 300, letterSpacing: '0.02em', lineHeight: 1.1 }}>
            {config.settings.intro_heading || 'Configure Your Bespoke Order'}
          </h2>
          <p className="mb-8 text-[12px] font-light leading-[2] tracking-[0.04em] text-[#6A6A6A]">
            {config.settings.intro_subtitle}
          </p>

          <div className="flex flex-col gap-3.5">
            {config.guarantees.map((item, i) => (
              <div key={item.id ?? i} className="flex items-start gap-3.5 text-[11px] font-light leading-[1.6] tracking-[0.04em] text-[#253246]">
                <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0A1628]" />
                {item.label}
              </div>
            ))}
          </div>
        </RevealDiv>

        <RevealDiv delay={100}>
          <div className="border border-[rgba(10,22,40,0.10)] bg-white px-11 py-11 max-md:px-[22px] max-md:py-7">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
                <div>
                  <label className="mb-2 block text-[9px] font-normal uppercase tracking-[0.28em] text-[#6A6A6A]" htmlFor="b-name">
                    Full Name
                  </label>
                  <input id="b-name" type="text" required value={form.name} onChange={set('name')} className={inputClasses} />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-normal uppercase tracking-[0.28em] text-[#6A6A6A]" htmlFor="b-email">
                    Email
                  </label>
                  <input id="b-email" type="email" required value={form.email} onChange={set('email')} className={inputClasses} />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-normal uppercase tracking-[0.28em] text-[#6A6A6A]" htmlFor="b-phone">
                    Phone / WhatsApp
                  </label>
                  <input id="b-phone" type="tel" value={form.phone} onChange={set('phone')} className={inputClasses} />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-normal uppercase tracking-[0.28em] text-[#6A6A6A]" htmlFor="b-country">
                    Country
                  </label>
                  <input id="b-country" type="text" required value={form.country} onChange={set('country')} className={inputClasses} />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-normal uppercase tracking-[0.28em] text-[#6A6A6A]" htmlFor="b-piece">
                    Piece Type
                  </label>
                  <Select
                    required
                    validationLabel="Piece type"
                    value={form.piece}
                    onValueChange={setDropdown('piece')}
                    placeholder="Select piece..."
                    options={config.pieceTypes.map((item) => ({ value: item.label, label: item.label }))}
                    triggerClassName="bg-[#FCFCFA] font-sans text-[13px] font-light tracking-[0.02em] text-[#0A1628]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-normal uppercase tracking-[0.28em] text-[#6A6A6A]" htmlFor="b-stone">
                    Preferred Stone
                  </label>
                  <Select
                    validationLabel="Preferred stone"
                    value={form.stone}
                    onValueChange={setDropdown('stone')}
                    placeholder="Stone preference..."
                    options={config.stoneOptions.map((item) => ({ value: item.label, label: item.label }))}
                    triggerClassName="bg-[#FCFCFA] font-sans text-[13px] font-light tracking-[0.02em] text-[#0A1628]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-normal uppercase tracking-[0.28em] text-[#6A6A6A]" htmlFor="b-carat">
                    Approx. Carat
                  </label>
                  <Select
                    validationLabel="Approximate carat"
                    value={form.carat}
                    onValueChange={setDropdown('carat')}
                    placeholder="Select size..."
                    options={config.caratOptions.map((item) => ({ value: item.label, label: item.label }))}
                    triggerClassName="bg-[#FCFCFA] font-sans text-[13px] font-light tracking-[0.02em] text-[#0A1628]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-normal uppercase tracking-[0.28em] text-[#6A6A6A]" htmlFor="b-metal">
                    Preferred Metal
                  </label>
                  <Select
                    validationLabel="Preferred metal"
                    value={form.metal}
                    onValueChange={setDropdown('metal')}
                    placeholder="Select metal..."
                    options={config.metalOptions.map((item) => ({ value: item.label, label: item.label }))}
                    triggerClassName="bg-[#FCFCFA] font-sans text-[13px] font-light tracking-[0.02em] text-[#0A1628]"
                  />
                </div>

                <div className="col-span-2 max-md:col-span-1">
                  <label className="mb-2 block text-[9px] font-normal uppercase tracking-[0.28em] text-[#6A6A6A]" htmlFor="b-message">
                    Describe Your Vision
                  </label>
                  <textarea
                    id="b-message"
                    rows={4}
                    required
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Design ideas, inspiration, occasion, budget range, timeline..."
                    className="min-h-[100px] w-full resize-y border border-[rgba(10,22,40,0.10)] bg-[#FAFBFD] px-4 py-3.5 font-sans text-[13px] font-light tracking-[0.02em] text-[#0A1628] transition-all duration-300 focus:border-[#0A1628] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(10,22,40,0.10)] pt-6">
                <p className="text-[10px] tracking-[0.04em] text-[#6A6A6A]">
                  {config.settings.footer_note}
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative inline-flex cursor-pointer items-center gap-2.5 overflow-hidden border-none bg-[#0A1628] px-[34px] py-4 text-[10px] font-normal uppercase tracking-[0.28em] text-[#FAFBFD] transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(10,22,40,0.18)]"
                >
                  <span className="absolute inset-0 z-0 translate-y-full bg-[#0A1628] transition-transform duration-[450ms] ease-[cubic-bezier(0.77,0,0.18,1)] group-hover:translate-y-0" />
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
