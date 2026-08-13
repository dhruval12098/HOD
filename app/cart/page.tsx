import type { Metadata } from 'next'
import CartClient from '@/components/pages/CartClient'

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Your House of Diams cart.',
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return <CartClient />
}
