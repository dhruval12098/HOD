import type { Metadata } from 'next';
import HipHopClient from '@/components/pages/HipHopClient';

export const metadata: Metadata = {
  title: 'Hip Hop',
  description: 'Explore House of Diams hip hop jewellery, including chains, grillz, pendants, and rings.',
};

export default function HipHopPage() {
  return <HipHopClient />;
}
