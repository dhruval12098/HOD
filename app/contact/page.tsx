import type { Metadata } from 'next';
import ContactClient from '@/components/pages/ContactClient';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Contact',
  description: 'Contact House of Diams for bespoke orders, wholesale, or general enquiries.',
  path: '/contact',
});

export default function ContactPage() {
  return <ContactClient />;
}
