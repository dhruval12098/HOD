'use client';

import { useState } from 'react';
import TrustStrip from '@/components/home/TrustStrip';
import Hero from '@/components/home/Hero';
import TestimonialMarquee from '@/components/home/TestimonialMarquee';
import Manufacturing from '@/components/home/Manufacturing';
import Collection from '@/components/home/Collection';
import StatsStrip from '@/components/home/StatsStrip';
import Testimonials from '@/components/home/Testimonials';
import Certifications from '@/components/home/Certifications';
import FAQ from '@/components/home/FAQ';
import InstagramReels from '@/components/home/InstagramReels';
import Newsletter from '@/components/home/Newsletter';
import EnquireModal from '@/components/home/EnquireModal';
import Loader from '@/components/home/Loader';
import Toast from '@/components/home/Toast';
import MaterialStrip from '@/components/home/MaterialStrip';
import DiamondScroll from '@/components/home/DiamondInfo';

export default function HomeClient() {
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [enquireGemName, setEnquireGemName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isLoading] = useState(false);

  const handleEnquireOpen = (name: string = '') => {
    setEnquireGemName(name);
    setIsEnquireOpen(true);
  };

  const handleEnquireClose = () => {
    setIsEnquireOpen(false);
    setEnquireGemName('');
  };

  const handleToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      {isLoading && <Loader />}

      <TrustStrip />
      <Hero />
      <TestimonialMarquee />
      <Manufacturing />
      <Collection />
      <DiamondScroll />
      <StatsStrip />
      <MaterialStrip />
      <Testimonials />
      <Certifications />
      <FAQ />
      <InstagramReels />
      <Newsletter onToast={handleToast} />

      <EnquireModal open={isEnquireOpen} piece={enquireGemName} onClose={handleEnquireClose} />
      <Toast message={toastMessage} visible={showToast} />
    </div>
  );
}

