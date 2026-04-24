import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import CheckoutPageClient from '@/components/checkout/CheckoutPageClient';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Static checkout preview for House of Diams.',
};

export default function CheckoutPage() {
  return (
    <div className={plusJakartaSans.className}>
      <CheckoutPageClient />
    </div>
  );
}
