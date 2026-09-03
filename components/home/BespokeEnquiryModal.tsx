'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn-select';
import { useToast } from './Toast';

interface BespokeEnquiryModalProps {
  open: boolean;
  onClose: () => void;
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
    { label: 'Colourless Lab-Grown Diamond' },
    { label: 'Fancy Colour Lab-Grown Diamond' },
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

export default function BespokeEnquiryModal({ open, onClose }: BespokeEnquiryModalProps) {
  const { showToast } = useToast();
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

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const htmlStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const previousBodyOverflow = bodyStyle.overflow;
    const previousHtmlOverflow = htmlStyle.overflow;
    const previousBodyPosition = bodyStyle.position;
    const previousBodyTop = bodyStyle.top;
    const previousBodyWidth = bodyStyle.width;
    const lenis = (window as typeof window & { __lenis?: { stop?: () => void; start?: () => void } }).__lenis;

    lenis?.stop?.();
    document.body.classList.add('modal-open');
    bodyStyle.overflow = 'hidden';
    htmlStyle.overflow = 'hidden';
    bodyStyle.position = 'fixed';
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.width = '100%';

    return () => {
      document.body.classList.remove('modal-open');
      bodyStyle.overflow = previousBodyOverflow;
      htmlStyle.overflow = previousHtmlOverflow;
      bodyStyle.position = previousBodyPosition;
      bodyStyle.top = previousBodyTop;
      bodyStyle.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
      lenis?.start?.();
    };
  }, [open]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  const setDropdown = (field: 'piece' | 'stone' | 'carat' | 'metal') => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
      showToast("Bespoke enquiry sent - we'll reply within 24 hours");
      setForm({ name: '', email: '', phone: '', country: '', piece: '', stone: '', carat: '', metal: '', message: '' });
      setTimeout(onClose, 800);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to submit enquiry right now.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bespoke enquiry"
      className="fixed inset-0 z-[10002] flex items-center justify-center overflow-hidden overscroll-none bg-[rgba(10,22,40,0.6)] p-3 backdrop-blur-md sm:p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        data-lenis-prevent
        onWheel={(event) => event.stopPropagation()}
        className="relative max-h-[calc(100dvh-24px)] w-full max-w-[760px] touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain border border-[rgba(10,22,40,0.12)] bg-white px-6 py-8 shadow-[0_24px_80px_rgba(10,22,40,0.2)] [scrollbar-color:rgba(10,22,40,0.28)_transparent] [scrollbar-width:thin] sm:max-h-[90dvh] md:px-10 md:py-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(10,22,40,0.28)] [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(10,22,40,0.12)] text-[#0A1628] transition hover:bg-[#0A1628] hover:text-white"
        >
          x
        </button>

        <div className="text-[10px] font-normal uppercase tracking-[0.3em] text-[#8B7B5C]">Bespoke Atelier</div>
        <h3 className="mt-3 font-display-title text-[34px] font-light leading-[1.08] tracking-[0.01em] text-[#0A1628]">
          {config.settings.intro_heading || 'Configure Your Bespoke Order'}
        </h3>
        <p className="mt-3 max-w-[500px] text-[13px] font-light leading-[1.8] tracking-[0.03em] text-[#6A6A6A]">
          {config.settings.intro_subtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Full Name" htmlFor="bespoke-name">
              <input id="bespoke-name" name="name" type="text" required value={form.name} onChange={handleChange} className={inputClassName} />
            </FormField>
            <FormField label="Email" htmlFor="bespoke-email">
              <input id="bespoke-email" name="email" type="email" required value={form.email} onChange={handleChange} className={inputClassName} />
            </FormField>
            <FormField label="Phone / WhatsApp" htmlFor="bespoke-phone">
              <input id="bespoke-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputClassName} />
            </FormField>
            <FormField label="Country" htmlFor="bespoke-country">
              <input id="bespoke-country" name="country" type="text" required value={form.country} onChange={handleChange} className={inputClassName} />
            </FormField>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Piece Type" htmlFor="bespoke-piece">
              <input tabIndex={-1} readOnly required aria-label="Piece type" value={form.piece} className="pointer-events-none absolute h-px w-px opacity-0" />
              <Select
                value={form.piece}
                onValueChange={setDropdown('piece')}
              >
                <SelectTrigger id="bespoke-piece" className="rounded-none font-sans text-[13px] font-light tracking-[0.02em]">
                  <SelectValue placeholder="Select piece..." />
                </SelectTrigger>
                <SelectContent>
                  {config.pieceTypes.map((item) => (
                    <SelectItem key={item.id ?? item.label} value={item.label}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Preferred Stone" htmlFor="bespoke-stone">
              <Select
                value={form.stone}
                onValueChange={setDropdown('stone')}
              >
                <SelectTrigger id="bespoke-stone" className="rounded-none font-sans text-[13px] font-light tracking-[0.02em]">
                  <SelectValue placeholder="Stone preference..." />
                </SelectTrigger>
                <SelectContent>
                  {config.stoneOptions.map((item) => (
                    <SelectItem key={item.id ?? item.label} value={item.label}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Approx. Carat" htmlFor="bespoke-carat">
              <Select
                value={form.carat}
                onValueChange={setDropdown('carat')}
              >
                <SelectTrigger id="bespoke-carat" className="rounded-none font-sans text-[13px] font-light tracking-[0.02em]">
                  <SelectValue placeholder="Select size..." />
                </SelectTrigger>
                <SelectContent>
                  {config.caratOptions.map((item) => (
                    <SelectItem key={item.id ?? item.label} value={item.label}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Preferred Metal" htmlFor="bespoke-metal">
              <Select
                value={form.metal}
                onValueChange={setDropdown('metal')}
              >
                <SelectTrigger id="bespoke-metal" className="rounded-none font-sans text-[13px] font-light tracking-[0.02em]">
                  <SelectValue placeholder="Select metal..." />
                </SelectTrigger>
                <SelectContent>
                  {config.metalOptions.map((item) => (
                    <SelectItem key={item.id ?? item.label} value={item.label}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Describe Your Vision" htmlFor="bespoke-message">
            <textarea
              id="bespoke-message"
              name="message"
              required
              rows={4}
              value={form.message}
              onChange={handleChange}
              placeholder="Design ideas, stone preference, metal, budget range, timeline..."
              className={`${inputClassName} min-h-[110px] resize-y`}
            />
          </FormField>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center bg-[#0A1628] px-8 py-4 font-sans text-[10px] uppercase tracking-[0.28em] text-[#FAF7F2] transition hover:bg-[#8B7B5C] disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? 'Submitting...' : 'Submit Bespoke Enquiry'}
          </button>
          <p className="text-center text-[10px] tracking-[0.04em] text-[#6A6A6A]">{config.settings.footer_note}</p>
        </form>
      </div>
    </div>
  );
}

const inputClassName =
  'w-full border border-[rgba(10,22,40,0.10)] bg-[#FAFBFD] px-4 py-3.5 font-sans text-[13px] font-light tracking-[0.02em] text-[#0A1628] outline-none transition focus:border-[#0A1628] focus:bg-white';

function FormField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <label htmlFor={htmlFor} className="mb-2 block text-[9px] font-normal uppercase tracking-[0.28em] text-[#6A6A6A]">{label}</label>
      {children}
    </div>
  );
}
