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
      className="border-y border-[rgba(10,22,40,0.08)] bg-[#F5F7FC] px-5 py-20 sm:px-7 sm:py-24 lg:px-[52px] lg:py-28"
    >
      <div className="mx-auto max-w-[920px]">
        <header className="mx-auto mb-10 max-w-[680px] text-center sm:mb-12">
          <p className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[#61708A]">
            Piece by piece
          </p>
          <h2
            id="product-faq-heading"
            className="font-display-title text-[clamp(32px,4vw,48px)] font-normal leading-[1.05] tracking-[0.01em] text-[#0A1628]"
          >
            Product FAQs
          </h2>
          <p className="mx-auto mt-5 max-w-[58ch] font-sans text-[14px] font-light leading-[1.8] text-[#536078] sm:text-[15px]">
            Helpful details about this piece, from its craftsmanship to everyday care.
          </p>
        </header>

        <div className="border-t border-[rgba(10,22,40,0.16)]">
          {visibleItems.map((item, index) => {
            const key = item.id || `${item.question}-${index}`;
            const panelId = `product-faq-panel-${index}`;
            const buttonId = `product-faq-button-${index}`;
            const isOpen = Boolean(openItems[key]);

            return (
              <div key={key} className="border-b border-[rgba(10,22,40,0.16)]">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() =>
                      setOpenItems((current) => ({ ...current, [key]: !current[key] }))
                    }
                    className="flex min-h-[72px] w-full items-center justify-between gap-6 py-5 text-left font-sans text-[15px] font-medium leading-[1.5] text-[#0A1628] outline-none transition-colors hover:text-[#31415D] focus-visible:ring-2 focus-visible:ring-[#0A1628] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F5F7FC] sm:min-h-[82px] sm:py-6 sm:text-[17px]"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-5 w-5 shrink-0 text-[#61708A] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
                    <div className="max-w-[72ch] pb-7 pr-10 font-sans text-[14px] font-light leading-[1.85] text-[#536078] sm:pb-8 sm:text-[15px]">
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
