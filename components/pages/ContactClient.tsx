'use client';

import TrustStrip from '@/components/home/TrustStrip';
import { ToastProvider, useToast } from '@/components/home/Toast';

import ContactHero from '@/components/contact/ContactHero';
import ContactBody from '@/components/contact/ContactBody';
import ContactMap from '@/components/contact/ContactMap';
import FAQ from '../home/FAQ';

function ContactInner() {
  const { showToast } = useToast();

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
     
      <ContactHero />
      <ContactBody onSuccess={(msg: string) => showToast(msg)} />
      <ContactMap />
      <FAQ />
    </div>
  );
}

export default function ContactClient() {
  return (
    <ToastProvider>
      <ContactInner />
    </ToastProvider>
  );
}

