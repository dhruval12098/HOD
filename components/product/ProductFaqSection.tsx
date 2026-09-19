'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ProductFaqItem {
  id?: string;
  question: string;
  answer: string;
}

interface ProductFaqSectionProps {
  items?: ProductFaqItem[];
}

export default function ProductFaqSection({ items = [] }: ProductFaqSectionProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const visibleItems = useMemo(
    () => items.filter((item) => item?.question?.trim() && item?.answer?.trim()),
    [items]
  );

  if (visibleItems.length === 0) return null;

  return (
    <section
      aria-labelledby="product-faq-heading"
      className="border-y border-[color:var(--theme-border,rgba(0,0,0,0.09))] bg-white px-5 py-20 sm:px-7 sm:py-24 lg:px-[52px] lg:py-28"
    >
      <div className="mx-auto max-w-[920px]">
        <header className="mx-auto mb-10 max-w-[680px] text-center sm:mb-12">
          <p className="mb-4 font-[family-name:var(--font-family-secondary)] text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--theme-muted,#6a6a6a)]">
            Piece by piece
          </p>
          <h2
            id="product-faq-heading"
            className="font-[family-name:var(--font-family-primary)] text-[clamp(32px,4vw,48px)] font-normal leading-[1.05] tracking-[0.01em] text-[var(--color-brand-primary,#000000)]"
          >
            Product FAQs
          </h2>
          <p className="mx-auto mt-5 max-w-[58ch] font-[family-name:var(--font-family-secondary)] text-[14px] font-light leading-[1.8] text-[var(--theme-muted,#6a6a6a)] sm:text-[15px]">
            Helpful details about this piece, from its craftsmanship to everyday care.
          </p>
        </header>

        <div className="border-t border-[color:var(--theme-border-strong,rgba(0,0,0,0.2))]">
          {visibleItems.map((item, index) => {
            const key = item.id || `${item.question}-${index}`;
            const panelId = `product-faq-panel-${index}`;
            const buttonId = `product-faq-button-${index}`;
            const isOpen = Boolean(openItems[key]);

            return (
              <div key={key} className="border-b border-[color:var(--theme-border-strong,rgba(0,0,0,0.2))]">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() =>
                      setOpenItems((current) => ({ ...current, [key]: !current[key] }))
                    }
                    className="flex min-h-[72px] w-full items-center justify-between gap-6 py-5 text-left font-[family-name:var(--font-family-secondary)] text-[15px] font-medium leading-[1.5] text-[var(--color-brand-primary,#000000)] outline-none transition-colors hover:text-[var(--theme-muted,#6a6a6a)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary,#000000)] focus-visible:ring-offset-4 focus-visible:ring-offset-white sm:min-h-[82px] sm:py-6 sm:text-[17px]"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-5 w-5 shrink-0 text-[var(--theme-muted,#6a6a6a)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="max-w-[72ch] pb-7 pr-10 font-[family-name:var(--font-family-secondary)] text-[14px] font-light leading-[1.85] text-[var(--theme-muted,#6a6a6a)] sm:pb-8 sm:text-[15px]">
                      {item.answer
                        .split(/\n+/)
                        .map((entry) => entry.trim())
                        .filter(Boolean)
                        .map((entry, paragraphIndex) => (
                          <p key={`${key}-${paragraphIndex}`} className="mb-3 last:mb-0">
                            {entry}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
