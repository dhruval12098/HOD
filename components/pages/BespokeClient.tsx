'use client';

import { useState } from 'react';
import EnquireModal from '@/components/home/EnquireModal';
import { useToast } from '@/components/home/Toast';

import BespokeHero from '@/components/bespoke/BespokeHero';
import ProcessSteps from '@/components/bespoke/ProcessSteps';
import BespokePortfolio from '@/components/bespoke/BespokePortfolio';
import BespokeForm from '@/components/bespoke/BespokeForm';
import CategoryFaqSection, { type CategoryFaqItem } from '@/components/shop/CategoryFaqSection';
import MoreToExplore, { type MoreToExploreCategory } from '@/components/shop/MoreToExplore';

const bespokeFaqItems: CategoryFaqItem[] = [
  { id: 1, question: 'How does the bespoke process begin?', answer: 'Share your idea, inspiration, preferred stone, metal and budget. Our design team will guide you through the next steps.' },
  { id: 2, question: 'Can I use a reference image?', answer: 'Yes. Upload or describe any reference during your enquiry and we will use it to prepare your bespoke proposal.' },
  { id: 3, question: 'How long does a bespoke piece take?', answer: 'Timelines vary by design and stone selection. Your specialist will confirm the expected production window with your proposal.' },
];

type BespokeHeroContent = {
  badge_text?: string | null;
  eyebrow?: string | null;
  heading_line_1?: string | null;
  heading_line_2?: string | null;
  subtitle?: string | null;
  primary_cta_label?: string | null;
  secondary_cta_label?: string | null;
  secondary_cta_action?: string | null;
  slider_enabled?: boolean | null;
};

type BespokeHeroSlide = {
  sort_order: number;
  image_path: string;
  mobile_image_path?: string;
  button_text: string;
  button_link: string;
};

type BespokePortfolioCategory = {
  id: string;
  name: string;
  slug: string;
  image_path?: string | null;
};

type BespokePortfolioItem = {
  id: string;
  title: string;
  tag: string;
  media_type: 'image' | 'video';
  media_url?: string;
  thumbnail_url?: string;
  gem_style?: string | null;
  gem_color?: string | null;
  dark_theme: boolean;
  short_description?: string | null;
  category: BespokePortfolioCategory;
};

type BespokeFormOption = { id?: string; label: string; display_order?: number };
type BespokeFormConfig = {
  settings: { intro_heading: string; intro_subtitle: string; footer_note: string };
  guarantees: BespokeFormOption[];
  pieceTypes: BespokeFormOption[];
  stoneOptions: BespokeFormOption[];
  caratOptions: BespokeFormOption[];
  metalOptions: BespokeFormOption[];
};

type BespokePageProps = {
  hero?: BespokeHeroContent | null;
  slides?: BespokeHeroSlide[];
  processItems?: { id?: number; sort_order: number; eyebrow: string; title: string; description: string }[];
  portfolioCategories?: BespokePortfolioCategory[];
  portfolioItems?: BespokePortfolioItem[];
  formConfig?: BespokeFormConfig;
  moreToExploreCategories?: MoreToExploreCategory[];
};

function BespokeInner({
  hero,
  slides,
  processItems,
  portfolioCategories,
  portfolioItems,
  formConfig,
  moreToExploreCategories = [],
}: BespokePageProps) {
  const { showToast } = useToast();
  const [enquireOpen, setEnquireOpen] = useState(false);

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink) lg:-mt-[146px]">
      <div>
        <BespokeHero onEnquireClick={() => setEnquireOpen(true)} initialHero={hero} initialSlides={slides} initialCategories={portfolioCategories} />
        <ProcessSteps initialItems={processItems} />
        <BespokePortfolio initialCategories={portfolioCategories} initialItems={portfolioItems} />
        <BespokeForm initialConfig={formConfig} onSuccess={() => showToast("Enquiry sent - we'll reply within 24 hours")} />
        <CategoryFaqSection categoryName="Bespoke" items={bespokeFaqItems} />
        <MoreToExplore categories={moreToExploreCategories} />

        <EnquireModal open={enquireOpen} onClose={() => setEnquireOpen(false)} />
      </div>
    </div>
  );
}

export default function BespokeClient(props: BespokePageProps) {
  return <BespokeInner {...props} />;
}
