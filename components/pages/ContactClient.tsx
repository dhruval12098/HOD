'use client';

import TrustStrip from '@/components/home/TrustStrip';
import { ToastProvider, useToast } from '@/components/home/Toast';

import ContactHero from '@/components/contact/ContactHero';
import ContactBody from '@/components/contact/ContactBody';
import ContactMap from '@/components/contact/ContactMap';

function ContactInner() {
  const { showToast } = useToast();

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <TrustStrip />
      <ContactHero />
      <ContactBody onSuccess={(msg: string) => showToast(msg)} />
      <ContactMap />
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

