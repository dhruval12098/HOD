import type { Metadata } from 'next'
import FAQ from '@/components/home/FAQ'
import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import { createFaqSchema } from '@/lib/structured-data'
import { createSupabaseServerClient } from '@/lib/server-supabase'

export const metadata: Metadata = createPageMetadata({
  title: 'FAQ',
  description: 'Frequently asked questions about House of Diams orders, diamonds, shipping, and support.',
  path: '/faq',
})

const fallbackFaqs = [
  {
    question: "What's the difference between natural and CVD diamonds?",
    answer:
      'Both are real diamonds. Natural diamonds form over billions of years beneath the earth, while CVD diamonds are grown in controlled conditions. They are chemically, physically and optically identical. The key difference is origin and pricing.',
  },
  {
    question: 'Do your diamonds come with certification?',
    answer:
      'Every diamond comes with certification details based on the selected stone. We also provide a House of Diams certificate of authenticity with each order.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'Yes. We ship worldwide with secure, tracked, and insured delivery. Customs and duties may vary by country.',
  },
]

async function getFaqSchemaItems() {
  try {
    const supabase = createSupabaseServerClient()
    const { data: sectionData } = await supabase
      .from('support_faq_section')
      .select('id')
      .eq('section_key', 'global_support_faq')
      .maybeSingle()

    if (!sectionData?.id) return fallbackFaqs

    const { data: itemData, error } = await supabase
      .from('support_faq_items')
      .select('question, answer, sort_order')
      .eq('section_id', sectionData.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error || !itemData?.length) return fallbackFaqs

    return itemData
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
  } catch {
    return fallbackFaqs
  }
}

export default async function FaqPage() {
  const faqItems = await getFaqSchemaItems()

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-[#0A1628]">
      <JsonLd data={createFaqSchema(faqItems)} />
      <div className="pb-[40px] pt-[32px] max-md:pb-[24px] max-md:pt-[20px]">
        <FAQ />
      </div>
    </div>
  )
}
