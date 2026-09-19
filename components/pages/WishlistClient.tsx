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

const CACHE_TTL_MS = 5 * 60 * 1000
let catalogCache: { at: number; promise: Promise<SearchProduct[]> } | null = null

function loadCatalog(): Promise<SearchProduct[]> {
  if (catalogCache && Date.now() - catalogCache.at < CACHE_TTL_MS) return catalogCache.promise
  const promise = fetch('/api/public/products')
    .then(async (response) => {
      const payload = await response.json().catch(() => null)
      if (!response.ok || !Array.isArray(payload?.items)) throw new Error('catalog')
      return payload.items as SearchProduct[]
    })
    .catch(() => {
      catalogCache = null
      throw new Error('Unable to load products.')
    })
  catalogCache = { at: Date.now(), promise }
  return promise
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    loadCatalog()
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
  }, [])

  const items = useMemo(() => products.filter((product) => wishlist.includes(getProductKey(product))), [products, wishlist])

  return (
    <section className={embedded ? '' : 'mx-auto max-w-[1280px] px-5 py-16 sm:px-7 lg:px-[52px]'}>
      {embedded ? null : (
        <>
          <h1 className="font-serif text-[clamp(34px,5vw,58px)] font-light text-[#0A1628]">Wishlist</h1>
          <p className="mt-3 text-[13px] text-[#6A6A6A]">Saved pieces you may want to come back to.</p>
        </>
      )}
      {isLoading || !ready ? (
        wishlist.length ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {Array.from({ length: Math.min(wishlist.length, 6) }).map((_, index) => (
              <WishlistSkeletonCard key={index} />
            ))}
          </div>
        ) : null
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
