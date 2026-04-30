'use client';

import { useState } from 'react';
import EnquireModal from '@/components/home/EnquireModal';
import { ToastProvider, useToast } from '@/components/home/Toast';
import Loader from '@/components/home/Loader';
import { usePageLoaderCache } from '@/lib/hooks/usePageLoaderCache';

import BespokeHero from '@/components/bespoke/BespokeHero';
import ProcessSteps from '@/components/bespoke/ProcessSteps';
import BespokePortfolio from '@/components/bespoke/BespokePortfolio';
import BespokeForm from '@/components/bespoke/BespokeForm';
import Manufacturing from '../home/Manufacturing';

function BespokeInner({
  hero,
  slides,
  processItems,
  portfolioCategories,
  portfolioItems,
  manufacturingItems,
  formConfig,
}: {
  hero?: any;
  slides?: any[];
  processItems?: any[];
  portfolioCategories?: any[];
  portfolioItems?: any[];
  manufacturingItems?: any[];
  formConfig?: any;
}) {
  const { showToast } = useToast();
  const [enquireOpen, setEnquireOpen] = useState(false);
  const { pageLoading, handleLoaderComplete } = usePageLoaderCache({
    cacheKey: 'hod_bespoke_loader_v2',
    ttlMs: 1000 * 60 * 60 * 12,
    fallbackDelayMs: 260,
  });

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      {pageLoading ? <Loader ready onComplete={handleLoaderComplete} /> : null}
      <div
        aria-hidden={pageLoading}
        style={{
          opacity: pageLoading ? 0 : 1,
          transition: 'opacity .2s ease',
          pointerEvents: pageLoading ? 'none' : 'auto',
        }}
      >
        <BespokeHero onEnquireClick={() => setEnquireOpen(true)} initialHero={hero} initialSlides={slides} />
        <ProcessSteps initialItems={processItems} />
        <BespokePortfolio initialCategories={portfolioCategories} initialItems={portfolioItems} />
        <Manufacturing initialItems={manufacturingItems} />
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
  manufacturingItems?: any[];
  formConfig?: any;
}) {
  return (
    <ToastProvider>
      <BespokeInner {...props} />
    </ToastProvider>
  );
}
