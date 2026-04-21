'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import TrustStrip from '@/components/home/TrustStrip';
import Hero from '@/components/home/Hero';
import TestimonialMarquee from '@/components/home/TestimonialMarquee';
import Loader from '@/components/home/Loader';

const DiamondInfo = dynamic(() => import('@/components/home/DiamondInfo'), { ssr: false });
const Manufacturing = dynamic(() => import('@/components/home/Manufacturing'), { ssr: false });
const Collection = dynamic(() => import('@/components/home/Collection'), { ssr: false });
const MaterialStrip = dynamic(() => import('@/components/home/MaterialStrip'), { ssr: false });
const StatsStrip = dynamic(() => import('@/components/home/StatsStrip'), { ssr: false });
const HipHopShowcase = dynamic(() => import('@/components/home/HipHopShowcase'), { ssr: false });
const Certifications = dynamic(() => import('@/components/home/Certifications'), { ssr: false });
const Testimonials = dynamic(() => import('@/components/home/Testimonials'), { ssr: false });
const BlogSection = dynamic(() => import('@/components/home/BlogSection'), { ssr: false });
const CouplesSection = dynamic(() => import('@/components/home/CouplesSection'), { ssr: false });
const Newsletter = dynamic(() => import('@/components/home/Newsletter'), { ssr: false });
const EnquireModal = dynamic(() => import('@/components/home/EnquireModal'), { ssr: false });
const Toast = dynamic(() => import('@/components/home/Toast'), { ssr: false });


export default function HomeClient() {
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [enquireGemName, setEnquireGemName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [mountBelowFold, setMountBelowFold] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      setMountBelowFold(true);
    };

    const startOnUser = () => start();
    window.addEventListener('scroll', startOnUser, { once: true, passive: true });

    const fallback = setTimeout(() => {
      if (typeof (window as any).requestIdleCallback === 'function') {
        (window as any).requestIdleCallback(start, { timeout: 2000 });
      } else {
        start();
      }
    }, 1200);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      window.removeEventListener('scroll', startOnUser);
    };
  }, []);



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
      {isLoading && <Loader onComplete={() => setIsLoading(false)} />}

      {/* <TrustStrip /> */}
      <Hero />
      <TestimonialMarquee />

      {mountBelowFold && (
        <>
          <DiamondInfo />
          <Collection />
          <MaterialStrip />
          <StatsStrip />
          <HipHopShowcase />
          <Manufacturing />
          <Certifications />
          <Testimonials />
          <BlogSection />
          <CouplesSection />
          <Newsletter onToast={handleToast} />
        </>
      )}

      {isEnquireOpen && <EnquireModal open={isEnquireOpen} piece={enquireGemName} onClose={handleEnquireClose} />}
      <Toast message={toastMessage} visible={showToast} />
    </div>
  );
}
