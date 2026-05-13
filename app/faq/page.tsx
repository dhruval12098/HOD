import type { Metadata } from 'next'
import FAQ from '@/components/home/FAQ'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about House of Diams orders, diamonds, shipping, and support.',
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-[#0A1628]">
      <div className="pb-[40px] pt-[32px] max-md:pb-[24px] max-md:pt-[20px]">
        <FAQ />
      </div>
    </div>
  )
}
