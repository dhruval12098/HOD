'use client';

import { useState } from 'react';
import EnquireModal from '@/components/home/EnquireModal';
import { useToast } from '@/components/home/Toast';

import BespokeHero from '@/components/bespoke/BespokeHero';
import ProcessSteps from '@/components/bespoke/ProcessSteps';
import BespokePortfolio from '@/components/bespoke/BespokePortfolio';
import BespokeForm from '@/components/bespoke/BespokeForm';

function BespokeInner({
  hero,
  slides,
  processItems,
  portfolioCategories,
  portfolioItems,
  formConfig,
}: {
  hero?: any;
  slides?: any[];
  processItems?: any[];
  portfolioCategories?: any[];
  portfolioItems?: any[];
  formConfig?: any;
}) {
  const { showToast } = useToast();
  const [enquireOpen, setEnquireOpen] = useState(false);

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <div>
        <BespokeHero onEnquireClick={() => setEnquireOpen(true)} initialHero={hero} initialSlides={slides} />
        <ProcessSteps initialItems={processItems} />
        <BespokePortfolio initialCategories={portfolioCategories} initialItems={portfolioItems} />
        <BespokeForm initialConfig={formConfig} onSuccess={() => showToast("Enquiry sent - we'll reply within 24 hours")} />

        <EnquireModal open={enquireOpen} onClose={() => setEnquireOpen(false)} />
      </div>
    </div>
  );
}

export default function BespokeClient(props: {
  hero?: any;
  slides?: any[];
  processItems?: any[];
  portfolioCategories?: any[];
  portfolioItems?: any[];
  formConfig?: any;
}) {
  return <BespokeInner {...props} />;
}
