'use client';

import { useState, useEffect, useRef } from 'react';

// ── Reveal helper ──────────────────────────────────────────────────────────────
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

// ── Contact rows data ──────────────────────────────────────────────────────────
const contactRows = [
  {
    label: 'Email',
    value: 'info@houseofdiams.com',
    note: 'Replies within 24 hours',
    href: 'mailto:info@houseofdiams.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 5L9 10L16 5M3 3H15C16 3 16 4 16 4V14C16 14 16 15 15 15H3C2 15 2 14 2 14V4C2 4 2 3 3 3Z" stroke="#B8922A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Phone & WhatsApp',
    value: '+91 93285 36178',
    note: 'Mon–Sat · 10am–7pm IST',
    href: 'tel:+919328536178',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M16 12.5V14.5C16 15.3 15.3 16 14.5 16C7.1 16 2 10.9 2 3.5C2 2.7 2.7 2 3.5 2H5.5C6.1 2 6.5 2.4 6.6 3L7 5C7 5.5 6.8 6 6.4 6.3L5.4 7.1C6.3 9 7.5 10.5 9.4 11.4L10.2 10.4C10.5 10 11 9.8 11.5 9.8L13.5 10.2C14.1 10.3 14.5 10.7 14.5 11.3V12.5" stroke="#B8922A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Atelier · India',
    value: 'Surat, Gujarat',
    note: 'India · Headquarters & Workshop · By appointment only',
    href: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 16S15 11 15 7C15 3.7 12.3 1 9 1S3 3.7 3 7C3 11 9 16 9 16Z" stroke="#B8922A" strokeWidth="1.2" />
        <circle cx="9" cy="7" r="2" stroke="#B8922A" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: 'Office · USA',
    value: 'New York, NY',
    note: 'USA · Sales & Client Relations · By appointment only',
    href: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 16S15 11 15 7C15 3.7 12.3 1 9 1S3 3.7 3 7C3 11 9 16 9 16Z" stroke="#B8922A" strokeWidth="1.2" />
        <circle cx="9" cy="7" r="2" stroke="#B8922A" strokeWidth="1.2" />
      </svg>
    ),
  },
];

// ── Social icons ───────────────────────────────────────────────────────────────
const socials = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/houseofdiams',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23C21.85 8.4 21.85 8.8 21.85 12s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38a3.73 3.73 0 0 1-1.38.9c-.42.17-1.06.37-2.23.42-1.25.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.73 3.73 0 0 1-1.38-.9 3.73 3.73 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.2 15.6 2.15 15.2 2.15 12s0-3.6.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.14 0-3.51 0-4.74.07-1.06.05-1.64.22-2.02.37-.51.2-.87.44-1.25.82s-.62.74-.82 1.25c-.15.38-.32.96-.37 2.02C2.73 9.77 2.72 10.14 2.72 13.28s0 3.51.07 4.74c.05 1.06.22 1.64.37 2.02.2.51.44.87.82 1.25.38.38.74.62 1.25.82.38.15.96.32 2.02.37 1.23.06 1.6.07 4.74.07s3.51 0 4.74-.07c1.06-.05 1.64-.22 2.02-.37.51-.2.87-.44 1.25-.82.38-.38.62-.74.82-1.25.15-.38.32-.96.37-2.02.06-1.23.07-1.6.07-4.74s0-3.51-.07-4.74c-.05-1.06-.22-1.64-.37-2.02a3.35 3.35 0 0 0-.82-1.25 3.35 3.35 0 0 0-1.25-.82c-.38-.15-.96-.32-2.02-.37C15.51 4 15.14 4 12 4zM12 6.86a5.14 5.14 0 1 1 0 10.28 5.14 5.14 0 0 1 0-10.28zm0 8.48a3.34 3.34 0 1 0 0-6.68 3.34 3.34 0 0 0 0 6.68zm6.54-8.68a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z"/></svg>,
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/houseofdiams',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.09 5.66 21.25 10.44 22v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.77-1.63 1.57v1.88h2.78l-.45 2.91h-2.34V22C18.34 21.25 22 17.09 22 12.06z"/></svg>,
  },
  {
    label: 'Pinterest',
    href: 'https://pinterest.com/houseofdiams',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.23 2.64 7.85 6.35 9.3-.09-.79-.17-2 .04-2.86.19-.78 1.21-4.97 1.21-4.97s-.31-.62-.31-1.53c0-1.43.83-2.5 1.87-2.5.88 0 1.31.66 1.31 1.45 0 .88-.56 2.2-.85 3.42-.24 1.02.51 1.86 1.52 1.86 1.83 0 3.23-1.93 3.23-4.71 0-2.46-1.77-4.18-4.29-4.18-2.93 0-4.64 2.19-4.64 4.46 0 .88.34 1.83.76 2.35.08.1.1.19.07.29-.08.34-.26 1.04-.3 1.19-.05.19-.15.23-.35.14-1.3-.61-2.11-2.5-2.11-4.02 0-3.27 2.38-6.28 6.86-6.28 3.6 0 6.4 2.57 6.4 6 0 3.58-2.25 6.46-5.39 6.46-1.05 0-2.04-.55-2.38-1.2 0 0-.52 1.99-.65 2.48-.24.91-.87 2.05-1.29 2.75.97.3 2 .46 3.07.46 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>,
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@houseofdiams',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.71a8.16 8.16 0 0 0 4.77 1.52V6.78a4.85 4.85 0 0 1-1.84-.09z"/></svg>,
  },
];

// ── Shared input/select/textarea styles ────────────────────────────────────────
const inputCls =
  'w-full px-4 py-3.5 font-sans text-[13px] font-light text-[#14120D] bg-[#FBF9F5] border border-[rgba(20,18,13,0.10)] transition-all duration-300 focus:outline-none focus:border-[#B8922A] focus:bg-white tracking-[0.02em]';

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23B8922A' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 16px center',
};

// ── Props ──────────────────────────────────────────────────────────────────────
interface ContactBodyProps {
  onSuccess?: (msg: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ContactBody({ onSuccess }: ContactBodyProps) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', topic: '', message: '',
  });

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = [
      'Hi, new contact enquiry from the website:',
      '',
      form.name    && `Name: ${form.name}`,
      form.email   && `Email: ${form.email}`,
      form.phone   && `Phone: ${form.phone}`,
      form.topic   && `Topic: ${form.topic}`,
      form.message && `\nMessage:\n${form.message}`,
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/919328536178?text=${encodeURIComponent(text)}`, '_blank');
    onSuccess?.("Opening WhatsApp - we'll reply within 24 hours");
    setForm({ name: '', email: '', phone: '', topic: '', message: '' });
  };

  return (
    <section
      id="contact-form"
      className="max-w-[1200px] mx-auto py-20 px-[52px] grid grid-cols-[1fr_1.4fr] gap-[70px] items-start max-lg:grid-cols-1 max-lg:gap-10 max-lg:px-7 max-md:px-5 max-md:py-10"
    >
      {/* ── LEFT: Contact Info ── */}
      <RevealDiv>
        <h2 className="font-serif text-[32px] font-normal text-[#14120D] mb-8 tracking-[0.02em]">
          Reach Us
        </h2>

        {contactRows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-start gap-[18px] py-[22px] ${
              i < contactRows.length - 1 ? 'border-b border-[rgba(20,18,13,0.10)]' : ''
            }`}
          >
            {/* Icon circle */}
            <div className="w-11 h-11 flex-shrink-0 border border-[rgba(184,146,42,0.25)] rounded-full bg-[#F5EDD6] flex items-center justify-center">
              {row.icon}
            </div>
            <div>
              <div className="text-[9px] font-normal tracking-[0.28em] text-[#B8922A] uppercase mb-1">
                {row.label}
              </div>
              <div className={`text-[18px] font-normal text-[#14120D] mb-0.5 ${row.label === 'Phone & WhatsApp' ? 'font-numeric' : 'font-serif'}`}>
                {row.href ? (
                  <a href={row.href} className="text-[#14120D] no-underline hover:text-[#B8922A] transition-colors duration-300">
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </div>
              <div className="text-[10px] text-[#7A7060] tracking-[0.04em]">{row.note}</div>
            </div>
          </div>
        ))}

        {/* Socials */}
        <div className="flex gap-3 mt-[30px]">
          {socials.map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="w-[42px] h-[42px] rounded-full border border-[rgba(20,18,13,0.10)] flex items-center justify-center text-[#3A3628] no-underline transition-all duration-300 hover:bg-[#B8922A] hover:border-[#B8922A] hover:text-white hover:-translate-y-0.5"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </RevealDiv>

      {/* ── RIGHT: Form ── */}
      <RevealDiv delay={100}>
        <div className="bg-white px-11 py-11 border border-[rgba(20,18,13,0.10)] max-md:px-[22px] max-md:py-7">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">

              {/* Name */}
              <div>
                <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="c-name">
                  Full Name
                </label>
                <input
                  id="c-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={set('name')}
                  className={inputCls}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="c-email">
                  Email
                </label>
                <input
                  id="c-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={set('email')}
                  className={inputCls}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="c-phone">
                  Phone / WhatsApp
                </label>
                <input
                  id="c-phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  className={`${inputCls} font-numeric`}
                />
              </div>

              {/* Topic */}
              <div>
                <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="c-topic">
                  Enquiry Topic
                </label>
                <select
                  id="c-topic"
                  required
                  value={form.topic}
                  onChange={set('topic')}
                  className={`${inputCls} appearance-none pr-10 cursor-pointer`}
                  style={selectStyle}
                >
                  <option value="">Select topic…</option>
                  <option>Product Enquiry</option>
                  <option>Bespoke Order</option>
                  <option>B2B Wholesale</option>
                  <option>Press / Media</option>
                  <option>General Enquiry</option>
                </select>
              </div>

              {/* Message — full width */}
              <div className="col-span-2 max-md:col-span-1">
                <label className="block text-[9px] font-normal tracking-[0.28em] text-[#7A7060] uppercase mb-2" htmlFor="c-message">
                  Your Message
                </label>
                <textarea
                  id="c-message"
                  rows={4}
                  required
                  value={form.message}
                  onChange={set('message')}
                  className={`${inputCls} resize-y min-h-[100px]`}
                />
              </div>
            </div>

            {/* Submit row */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-[rgba(20,18,13,0.10)] flex-wrap gap-4">
              <p className="text-[10px] text-[#7A7060] tracking-[0.04em]">
                Replies within 24 hours
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#FBF9F5] bg-[#14120D] px-[34px] py-4 border-none cursor-pointer uppercase relative overflow-hidden group transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(184,146,42,0.18)]"
              >
                <span className="absolute inset-0 bg-[#B8922A] z-0 translate-y-full group-hover:translate-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.77,0,0.18,1)]" />
                <span className="relative z-10">Send Message</span>
              </button>
            </div>
          </form>
        </div>
      </RevealDiv>
    </section>
  );
}
