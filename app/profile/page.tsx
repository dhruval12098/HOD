import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import ProfileClient from '@/components/auth/ProfileClient';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Your House of Diams account profile.',
};

export default function ProfilePage() {
  return (
    <div className={plusJakartaSans.className}>
      <ProfileClient />
    </div>
  );
}
