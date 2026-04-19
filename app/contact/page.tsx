import type { Metadata } from 'next';
import ContactClient from '@/components/pages/ContactClient';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact House of Diams for bespoke orders, wholesale, or general enquiries.',
};

export default function ContactPage() {
  return <ContactClient />;
}
