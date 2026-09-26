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
  metalsFull?: { id: string; name: string; slug: string; colorHex?: string | null }[]
  metalMediaRows?: Array<{
    metal_id: string
    image_1_path?: string | null
    image_2_path?: string | null
    image_3_path?: string | null
    image_4_path?: string | null
    video_path?: string | null
  }>
  defaultMetalMedia?: {
    metal_id: string
    image_1_path?: string | null
    image_2_path?: string | null
    image_3_path?: string | null
    image_4_path?: string | null
    video_path?: string | null
  } | null
}

function loadWishlistProducts(keys: string[]): Promise<SearchProduct[]> {
  return fetch('/api/public/products', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ keys }),
  })
    .then(async (response) => {
      const payload = await response.json().catch(() => null)
      if (!response.ok || !Array.isArray(payload?.items)) throw new Error('catalog')
      return payload.items as SearchProduct[]
    })
    .catch(() => { throw new Error('Unable to load products.') })
}

function WishlistSkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-[18px] bg-[rgba(10,22,40,0.06)]" />
      <div className="mt-3 h-3 w-3/4 rounded-full bg-[rgba(10,22,40,0.08)]" />
      <div className="mt-2 h-3 w-1/3 rounded-full bg-[rgba(10,22,40,0.06)]" />
    </div>
  )
}

export default function WishlistClient({ embedded = false }: { embedded?: boolean }) {
  const { wishlist, toggle, ready } = useWishlistStore()
  const [products, setProducts] = useState<SearchProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!ready) return
    if (!wishlist.length) return
    let ignore = false
    setIsLoading(true)
    loadWishlistProducts(wishlist)
      .then((items) => {
        if (!ignore) setProducts(items)
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [ready, wishlist])

  const items = useMemo(() => products.filter((product) => wishlist.includes(getProductKey(product))), [products, wishlist])

  return (
    <section className={embedded ? '' : 'min-h-[calc(100vh-111px)] bg-white px-4 pb-16 pt-12 sm:px-7 sm:pb-24 sm:pt-16'}>
      <div className={embedded ? '' : 'mx-auto max-w-6xl'}>
      {embedded ? null : (
        <>
          <h1 className="text-center text-[clamp(1.35rem,2vw,1.75rem)] font-extrabold uppercase leading-none tracking-[0.04em] text-[#111111]">Wish List</h1>
          <p className="mt-4 text-center text-[13px] leading-[1.75] text-[#292727]">Saved pieces you may want to come back to.</p>
        </>
      )}
      {isLoading || !ready ? (
        wishlist.length ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {Array.from({ length: Math.min(wishlist.length, 6) }).map((_, index) => (
              <WishlistSkeletonCard key={index} />
            ))}
          </div>
        ) : null
      ) : items.length ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
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
        <div className="mt-8 border border-[#e4e4e4] bg-white px-6 py-12 text-center">
          <p className="text-[14px] text-[#292727]">Your wishlist is empty.</p>
          <Link href="/shop" className="brand-button mt-5">
            Explore Products
          </Link>
        </div>
      )}
      </div>
    </section>
  )
}
