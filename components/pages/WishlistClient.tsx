'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useWishlistStore } from '@/lib/hooks/useWishlistStore'
import { getProductKey } from '@/lib/product-keys'
import ProductCard from '@/components/shop/ProductCard'

type SearchProduct = {
  id: number
  dbId?: string
  slug: string
  name: string
  shortMeta: string
  imageUrl?: string
  priceFrom: number
  category?: string
  featured?: boolean
  isNew?: boolean
  gemColor?: string
  gemStyle?: string
}

export default function WishlistClient() {
  const { wishlist, toggle, ready } = useWishlistStore()
  const [products, setProducts] = useState<SearchProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      const response = await fetch('/api/public/products', { cache: 'no-store' })
      const payload = await response.json().catch(() => null)
      if (!ignore && response.ok && Array.isArray(payload?.items)) setProducts(payload.items)
      if (!ignore) setIsLoading(false)
    }
    void load()
    return () => {
      ignore = true
    }
  }, [])

  const items = useMemo(() => products.filter((product) => wishlist.includes(getProductKey(product))), [products, wishlist])

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 sm:px-7 lg:px-[52px]">
      <h1 className="font-serif text-[clamp(34px,5vw,58px)] font-light text-[#0A1628]">Wishlist</h1>
      <p className="mt-3 text-[13px] text-[#6A6A6A]">Saved pieces you may want to come back to.</p>
      {isLoading || !ready ? (
        <div className="mt-10 rounded-[24px] border border-[rgba(10,22,40,0.08)] bg-white px-6 py-12 text-center">
          <p className="text-[14px] text-[#6A6A6A]">Loading your saved pieces...</p>
        </div>
      ) : items.length ? (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <ProductCard
              key={item.dbId || item.slug}
              product={item}
              wishlisted={wishlist.includes(getProductKey(item))}
              onWishlist={() => toggle(getProductKey(item))}
              onEnquire={() => {}}
              forceLight
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[24px] border border-[rgba(10,22,40,0.08)] bg-white px-6 py-12 text-center">
          <p className="text-[14px] text-[#6A6A6A]">Your wishlist is empty.</p>
          <Link href="/shop" className="mt-5 inline-flex rounded-full bg-[#0A1628] px-6 py-3 text-[10px] uppercase tracking-[0.24em] text-white">
            Explore Products
          </Link>
        </div>
      )}
    </section>
  )
}
