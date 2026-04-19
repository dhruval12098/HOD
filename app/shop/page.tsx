import type { Metadata } from 'next';
import ShopClient from '@/components/pages/ShopClient';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our collection of fine jewellery and hip hop jewellery with natural and CVD diamonds.',
};

export default function ShopPage() {
  return <ShopClient />;
}
