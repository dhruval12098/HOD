'use client';

import { useState, useEffect, useRef } from 'react';

const faqs = [
  {
    q: "What's the difference between natural and CVD diamonds?",
    a: "Both are real diamonds. Natural diamonds form over billions of years beneath the earth; CVD (Chemical Vapour Deposition) diamonds are grown in controlled conditions over weeks. They are chemically, physically and optically identical. The difference is origin — and price. We offer both so you can choose what feels right for you.",
  },
  {
    q: 'How do CVD and natural diamonds compare in price?',
    a: 'CVD diamonds typically cost 40 to 70 percent less than natural diamonds of the same 4Cs — allowing a larger, cleaner or higher-colour stone for the same budget. Natural diamonds, however, carry rarity value and a long-term store of worth. We advise clients on both based on purpose — investment, heirloom, or everyday.',
  },
  {
    q: 'Do your diamonds come with certification?',
    a: 'Every diamond comes with an IGI certification as standard. GIA certification is available on request. Each piece ships with its original grading report and a House of Diams certificate of authenticity.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes. We ship to over 40 countries with fully insured, tracked delivery via FedEx, DHL or Brinks. Complimentary worldwide shipping is included on all orders. Customs and duties vary by country — we provide all documentation required.',
  },
  {
    q: 'What is your bespoke process?',
    a: 'Four steps — Consult (share your vision), Design (we prepare CAD renders for your approval), Craft (hand-set by master jewellers in Surat), Deliver (insured and tracked). Typical timeline is 4 to 8 weeks depending on complexity.',
  },
  {
    q: 'Do you offer B2B wholesale pricing?',
    a: 'Absolutely. We partner with jewellers, retailers and designers across 40+ countries. Please reach out via our Contact form selecting "B2B Wholesale Enquiry" and our team will share our full wholesale catalogue and pricing structure.',
  },
];

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

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIdx(prev => (prev === i ? null : i));

  return (
    <section className="py-[110px] px-[52px] max-w-[900px] mx-auto max-lg:px-7 max-md:px-5 max-md:py-[70px]">
      {/* Header */}
      <div className="text-center flex flex-col items-center mb-0">
        <RevealDiv className="flex justify-center">
          <div className="text-[10px] font-normal tracking-[0.32em] text-[#B8922A] uppercase mb-[18px] inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
            Frequently Asked
          </div>
        </RevealDiv>
        <RevealDiv delay={100}>
          <h2
            className="font-serif font-light tracking-[0.02em] text-[#14120D] leading-[1.05] text-center"
            style={{ fontSize: 'clamp(40px, 5.5vw, 72px)' }}
          >
            Your <em className="not-italic text-[#B8922A] font-normal">Questions</em>
          </h2>
        </RevealDiv>
      </div>

      {/* Accordion */}
      <div className="mt-12">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              className={`border-b border-[rgba(20,18,13,0.10)] transition-colors duration-300 ${
                isOpen ? 'bg-[#F6F2EA]' : 'hover:bg-[#F6F2EA]'
              }`}
            >
              <button
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="w-full text-left px-6 py-7 bg-transparent border-none cursor-pointer flex items-center justify-between gap-5 font-serif text-[20px] font-normal text-[#14120D] tracking-[0.02em] transition-colors duration-300 hover:text-[#B8922A]"
              >
                <span>{faq.q}</span>

                {/* +/× toggle circle */}
                <span
                  className={`flex-shrink-0 w-8 h-8 border rounded-full flex items-center justify-center transition-all duration-400 ${
                    isOpen
                      ? 'bg-[#B8922A] border-[#B8922A] rotate-45'
                      : 'bg-transparent border-[rgba(20,18,13,0.10)]'
                  }`}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={`transition-[stroke] duration-300 ${isOpen ? 'stroke-white' : 'stroke-[#3A3628]'}`}
                  >
                    <path d="M6 1V11M1 6H11" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              {/* Answer — animated max-height */}
              <div
                className="overflow-hidden transition-[max-height,padding] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ maxHeight: isOpen ? '300px' : '0px', padding: isOpen ? '0 24px 28px' : '0 24px' }}
              >
                <p className="text-[13px] font-light leading-[1.9] text-[#7A7060] tracking-[0.02em] max-w-[720px]">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
