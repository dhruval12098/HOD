import type { Metadata } from 'next';
import TrustStrip from '@/components/home/TrustStrip';
import B2BPage from '@/components/b2b/B2BPage';

export const metadata: Metadata = {
  title: 'B2B',
  description: 'B2B diamonds and jewellery supply: certified stones, consistent parcels, and global fulfilment.',
};

export default function B2BRoutePage() {
  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <TrustStrip />
      <B2BPage />
    </div>
  );
}
