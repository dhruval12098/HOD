'use client';

import { useState } from 'react';
import TrustStrip from '@/components/home/TrustStrip';
import ShopHero from '@/components/shop/ShopHero';
import ProductGrid from '@/components/shop/ProductGrid';
import EnquireModal from '@/components/home/EnquireModal';

export default function ShopClient() {
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [enquirePiece, setEnquirePiece] = useState('');

  const handleEnquire = (name: string = '') => {
    setEnquirePiece(name);
    setIsEnquireOpen(true);
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <TrustStrip />
      <ShopHero />
      <ProductGrid onEnquire={handleEnquire} />
      <EnquireModal open={isEnquireOpen} piece={enquirePiece} onClose={() => setIsEnquireOpen(false)} />
    </div>
  );
}

