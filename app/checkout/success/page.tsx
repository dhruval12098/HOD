import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import CheckoutSuccessClient from '@/components/checkout/CheckoutSuccessClient';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Order Success',
  description: 'Order confirmation preview for House of Diams.',
};

export default function CheckoutSuccessPage() {
  return (
    <div className={plusJakartaSans.className}>
      <CheckoutSuccessClient />
    </div>
  );
}
