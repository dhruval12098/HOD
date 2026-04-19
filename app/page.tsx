import type { Metadata } from 'next';
import HomeClient from '@/components/pages/HomeClient';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Luxury diamond jewellery, natural and CVD diamonds, crafted in Surat, India.',
};

export default function Home() {
  return <HomeClient />;
}
