import type { ReactNode } from 'react';

export default function CheckoutSectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[24px] border border-[#e7ebf0] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="mb-5">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#101828]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[#667085]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
