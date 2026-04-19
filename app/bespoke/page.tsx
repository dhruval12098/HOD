import type { Metadata } from 'next';
import BespokeClient from '@/components/pages/BespokeClient';

export const metadata: Metadata = {
  title: 'Bespoke',
  description: 'Commission a bespoke piece. From CAD to setting, crafted in Surat with natural or CVD diamonds.',
};

export default function BespokePage() {
  return <BespokeClient />;
}
