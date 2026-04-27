import type { Metadata } from 'next'
import WishlistClient from '@/components/pages/WishlistClient'

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Saved House of Diams pieces.',
}

export default function WishlistPage() {
  return <WishlistClient />
}
