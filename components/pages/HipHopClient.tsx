'use client';

import { useState } from 'react';
import TrustStrip from '@/components/home/TrustStrip';
import StatsStrip from '@/components/home/StatsStrip';
import Footer from '@/components/common/Footer';
import HipHopHero from '@/components/hiphop/HipHopHero';
import HipHopCollection from '@/components/hiphop/HipHopCollection';
import Overlay from '@/components/hiphop/Overlay';
import MobileDrawer from '@/components/hiphop/MobileDrawer';
import Toast from '@/components/home/Toast';
import EnquireModal from '@/components/home/EnquireModal';
import FloatingWidgets from '@/components/home/FloatingWidgets';

export default function HipHopClient() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [enquirePiece, setEnquirePiece] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const openEnquire = (piece: string) => {
    setEnquirePiece(piece);
    setEnquireOpen(true);
  };

  const handleWishlistToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 2800);
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <TrustStrip />
      <HipHopHero />

      <div className="max-w-[1400px] mx-auto px-[52px] pt-[36px] max-[700px]:px-5">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2.5 text-[10px] font-normal tracking-[0.28em] uppercase text-[#14120D] border border-[#14120D] px-8 py-[15px] bg-transparent cursor-pointer transition-all duration-400 hover:bg-[#14120D] hover:text-[#FBF9F5]"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Open Navigation
        </button>
      </div>

      <HipHopCollection onEnquire={openEnquire} onWishlistToast={handleWishlistToast} />
      <StatsStrip />
      
      <FloatingWidgets />

      <Overlay isVisible={drawerOpen} onClick={() => setDrawerOpen(false)} />
      <MobileDrawer
        isOpen={drawerOpen}
        activeHref="/hiphop"
        onEnquire={() => {
          setDrawerOpen(false);
          openEnquire('Hip Hop Enquiry');
        }}
      />

      {enquireOpen && (
        <EnquireModal
          open={enquireOpen}
          piece={enquirePiece}
          onClose={() => setEnquireOpen(false)}
        />
      )}

      <Toast message={toastMessage} visible={showToast} />
    </div>
  );
}
