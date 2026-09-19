'use client'

import { useState } from 'react'

export type CategoryFaqItem = {
  id: number
  question: string
  answer: string
}

export default function CategoryFaqSection({ categoryName, items }: { categoryName: string; items: CategoryFaqItem[] }) {
  const [openId, setOpenId] = useState<number | null>(items[0]?.id ?? null)
  if (!items.length) return null

  return (
    <section className="border-t border-[#e4e4e4] bg-(--color-white) px-4 py-14 sm:px-7 sm:py-20" aria-labelledby="category-faq-heading">
      <div className="mx-auto grid max-w-6xl gap-8 border border-[#e4e4e4] bg-(--color-white) px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[0.3fr_0.7fr]">
        <h2 id="category-faq-heading" className="font-[family-name:var(--font-family-primary)] text-[16px] font-bold uppercase leading-[1.4] tracking-[0.06em] text-[#222222]">
          {categoryName} FAQ
        </h2>

        <div className="divide-y divide-[#e4e4e4]">
          {items.map((item) => {
            const isOpen = openId === item.id
            return (
              <article key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-5 py-4 text-left"
                >
                  <span className="font-[family-name:var(--font-family-secondary)] text-[13px] font-semibold text-[#222222]">{item.question}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={`shrink-0 stroke-current text-[#222222] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                    <path d="M6 1V11M1 6H11" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                {isOpen ? <p className="pb-5 font-[family-name:var(--font-family-secondary)] text-[13px] leading-[1.75] text-[#3f3f3f]">{item.answer}</p> : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
