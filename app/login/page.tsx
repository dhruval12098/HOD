import type { Metadata } from 'next';
import AuthForm from '@/components/auth/AuthForm';
import AuthShell from '@/components/auth/AuthShell';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your House of Diams account.',
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="House of Diams Access"
      title="Enter the private salon"
      description="A refined sign-in experience for clients returning to their curated House of Diams journey."
      asideTitle="Everything waiting for you"
      asideBody="Your account keeps the experience elegant and continuous across visits, enquiries, and future saved pieces."
      asidePoints={['Persistent Session', 'Private Access', 'Luxury Support']}
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
