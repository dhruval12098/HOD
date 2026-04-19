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
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const guarantees = [
  'Free design consultation · no obligation',
  'CAD rendering provided before production',
  'Full IGI / GIA certification included',
  'Insured worldwide shipping complimentary',
  '4–8 week typical lead time',
];

const selectClasses =
  'w-full px-4 py-3.5 font-sans text-[13px] font-light text-[#14120D] bg-[#FBF9F5] border border-[rgba(20,18,13,0.10)] transition-all duration-300 focus:outline-none focus:border-[#B8922A] focus:bg-white appearance-none pr-10';
const inputClasses =
  'w-full px-4 py-3.5 font-sans text-[13px] font-light text-[#14120D] bg-[#FBF9F5] border border-[rgba(20,18,13,0.10)] transition-all duration-300 focus:outline-none focus:border-[#B8922A] focus:bg-white';

// Custom select arrow SVG as bg
const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23B8922A' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 16px center',
};

interface BespokeFormProps {
  onSuccess?: () => void;
}

export default function BespokeForm({ onSuccess }: BespokeFormProps) {
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
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  return (
    <section
      id="bespoke-form"
      className="py-[110px] px-[52px] max-lg:px-7 max-md:px-5 max-md:py-[70px]"
      style={{ background: 'linear-gradient(180deg, #FBF9F5 0%, #F6F2EA 100%)' }}
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-[1fr_1.3fr] gap-20 items-start max-lg:grid-cols-1 max-lg:gap-10">

        {/* ── Left: Info ── */}
        <RevealDiv>
          <div className="w-[60px] h-px bg-[#B8922A] mb-6" />
          <div className="text-[10px] font-normal tracking-[0.32em] text-[#B8922A] uppercase mb-3.5 inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
            Start Your Piece
          </div>
          <h2
            className="font-serif font-light tracking-[0.02em] text-[#14120D] leading-[1.1] mb-5"
            style={{ fontSize: '48px' }}
          >
            Configure Your{' '}
            <em className="not-italic text-[#B8922A] font-normal">Bespoke Order</em>
          </h2>
          <p className="text-[12px] font-light leading-[2] text-[#7A7060] tracking-[0.04em] mb-8">
            Every bespoke commission begins with a conversation. Share your vision below and our
            team will be in touch within 24 hours with next steps.
          </p>

          {/* Guarantees */}
          <div className="flex flex-col gap-3.5">
            {guarantees.map((g, i) => (
              <div key={i} className="flex items-start gap-3.5 text-[11px] font-light leading-[1.6] text-[#3A3628] tracking-[0.04em]">
                <span className="w-1.5 h-1.5 bg-[#B8922A] rounded-full mt-[7px] flex-shrink-0" />
                {g}
              </div>
            ))}
          </div>
        </RevealDiv>

        {/* ── Right: Form ── */}
        <RevealDiv delay={100}>
          <div className="bg-white px-11 py-11 border border-[rgba(20,18,13,0.10)] max-md:px-[22px] max-md:py-7">
            <form onSubmit={handleSubmit}>
              {/* 2-col grid */}
              <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">

                {/* Name */}
                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="b-name">
                    Full Name
                  </label>
                  <input id="b-name" type="text" required value={form.name} onChange={set('name')} className={inputClasses} />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="b-email">
                    Email
                  </label>
                  <input id="b-email" type="email" required value={form.email} onChange={set('email')} className={inputClasses} />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="b-phone">
                    Phone / WhatsApp
                  </label>
                  <input id="b-phone" type="tel" value={form.phone} onChange={set('phone')} className={inputClasses} />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="b-country">
                    Country
                  </label>
                  <input id="b-country" type="text" required value={form.country} onChange={set('country')} className={inputClasses} />
                </div>

                {/* Piece Type */}
                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="b-piece">
                    Piece Type
                  </label>
                  <select id="b-piece" required value={form.piece} onChange={set('piece')} className={selectClasses} style={selectStyle}>
                    <option value="">Select piece…</option>
                    <option>Engagement Ring</option>
                    <option>Wedding Band</option>
                    <option>Tennis Bracelet</option>
                    <option>Necklace / Pendant</option>
                    <option>Earrings</option>
                    <option>Hip Hop Chain</option>
                    <option>Loose Diamond</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Stone */}
                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="b-stone">
                    Preferred Stone
                  </label>
                  <select id="b-stone" value={form.stone} onChange={set('stone')} className={selectClasses} style={selectStyle}>
                    <option value="">Stone preference…</option>
                    <option>Natural Diamond</option>
                    <option>CVD Colourless Diamond</option>
                    <option>CVD Fancy Colour Diamond</option>
                    <option>Natural Ruby</option>
                    <option>Natural Emerald</option>
                    <option>Natural Sapphire</option>
                    <option>Need Recommendation</option>
                  </select>
                </div>

                {/* Carat */}
                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="b-carat">
                    Approx. Carat
                  </label>
                  <select id="b-carat" value={form.carat} onChange={set('carat')} className={selectClasses} style={selectStyle}>
                    <option value="">Select size…</option>
                    <option>Under 0.5 ct</option>
                    <option>0.5 – 1.0 ct</option>
                    <option>1.0 – 2.0 ct</option>
                    <option>2.0 – 5.0 ct</option>
                    <option>5.0 ct+</option>
                  </select>
                </div>

                {/* Metal */}
                <div>
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="b-metal">
                    Preferred Metal
                  </label>
                  <select id="b-metal" value={form.metal} onChange={set('metal')} className={selectClasses} style={selectStyle}>
                    <option value="">Select metal…</option>
                    <option>18K Yellow Gold</option>
                    <option>18K White Gold</option>
                    <option>18K Rose Gold</option>
                    <option>14K Gold</option>
                    <option>Platinum</option>
                    <option>925 Silver</option>
                    <option>Not Sure</option>
                  </select>
                </div>

                {/* Vision textarea — full width */}
                <div className="col-span-2 max-md:col-span-1">
                  <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="b-message">
                    Describe Your Vision
                  </label>
                  <textarea
                    id="b-message"
                    rows={4}
                    required
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Design ideas, inspiration, occasion, budget range, timeline…"
                    className="w-full px-4 py-3.5 font-sans text-[13px] font-light text-[#14120D] bg-[#FBF9F5] border border-[rgba(20,18,13,0.10)] transition-all duration-300 focus:outline-none focus:border-[#B8922A] focus:bg-white resize-y min-h-[100px] tracking-[0.02em]"
                  />
                </div>
              </div>

              {/* Submit row */}
              <div className="flex justify-between items-center mt-5 pt-6 border-t border-[rgba(20,18,13,0.10)] flex-wrap gap-4">
                <p className="text-[10px] text-[#7A7060] tracking-[0.04em]">
                  We'll reply within 24 hours. Your details stay confidential.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#FBF9F5] bg-[#14120D] px-[34px] py-4 border-none cursor-pointer uppercase relative overflow-hidden group transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(184,146,42,0.18)]"
                >
                  <span className="absolute inset-0 bg-[#B8922A] z-0 translate-y-full group-hover:translate-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.77,0,0.18,1)]" />
                  <span className="relative z-10">Submit Enquiry</span>
                </button>
              </div>
            </form>
          </div>
        </RevealDiv>
      </div>
    </section>
  );
}
