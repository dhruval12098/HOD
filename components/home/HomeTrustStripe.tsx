'use client'

import { BadgeCheck, Globe2, ShieldCheck, Truck } from 'lucide-react'

const TRUST_ITEMS = [
  { label: 'Complimentary Overnight Shipping', Icon: Truck },
  { label: 'IGI Certified', Icon: BadgeCheck },
  { label: 'Free Worldwide Delivery', Icon: Globe2 },
  { label: 'Lifetime Warranty', Icon: ShieldCheck },
]

export default function HomeTrustStripe() {
  return (
    <section aria-label="House of Diams promises" className="flex min-h-[102px] w-full items-center justify-center overflow-x-auto bg-[var(--color-section-soft)] px-4 py-4">
      <div className="flex min-w-max items-center justify-center gap-6 sm:gap-10 lg:gap-16">
        {TRUST_ITEMS.map(({ label, Icon }) => (
          <div key={label} className="flex items-center gap-2.5 whitespace-nowrap text-black">
            <Icon aria-hidden="true" size={19} strokeWidth={1.5} className="shrink-0 text-[#0A1628]" />
            <span className="font-[family-name:var(--font-family-secondary)] text-[10px] font-medium uppercase tracking-[0.08em] sm:text-[11px]">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
