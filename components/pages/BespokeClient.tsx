'use client';

import { useState } from 'react';
import TrustStrip from '@/components/home/TrustStrip';
import Loader from '@/components/home/Loader';
import EnquireModal from '@/components/home/EnquireModal';
import { ToastProvider, useToast } from '@/components/home/Toast';

import BespokeHero from '@/components/bespoke/BespokeHero';
import ProcessSteps from '@/components/bespoke/ProcessSteps';
import BespokePortfolio from '@/components/bespoke/BespokePortfolio';
import BespokeForm from '@/components/bespoke/BespokeForm';

function BespokeInner() {
  const { showToast } = useToast();
  const [enquireOpen, setEnquireOpen] = useState(false);

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <Loader />
      <TrustStrip />

      <BespokeHero onEnquireClick={() => setEnquireOpen(true)} />
      <ProcessSteps />
      <BespokePortfolio />
      <BespokeForm onSuccess={() => showToast("Enquiry sent - we'll reply within 24 hours")} />

      <EnquireModal open={enquireOpen} onClose={() => setEnquireOpen(false)} />
    </div>
  );
}

export default function BespokeClient() {
  return (
    <ToastProvider>
      <BespokeInner />
    </ToastProvider>
  );
}

