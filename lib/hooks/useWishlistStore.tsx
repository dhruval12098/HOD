'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'hod_wishlist'

type WishlistContextValue = {
  wishlist: string[]
  count: number
  ready: boolean
  toggle: (key: string) => 'added' | 'removed'
  contains: (key: string) => boolean
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setWishlist(parsed.map(String))
      }
    } catch {}
    setReady(true)
  }, [])

  const persist = (next: string[]) => {
    setWishlist(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  const value = useMemo<WishlistContextValue>(() => ({
    wishlist,
    count: wishlist.length,
    ready,
    toggle: (key) => {
      const exists = wishlist.includes(key)
      persist(exists ? wishlist.filter((entry) => entry !== key) : [...wishlist, key])
      return exists ? 'removed' : 'added'
    },
    contains: (key) => wishlist.includes(key),
  }), [ready, wishlist])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlistStore() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlistStore must be used within WishlistProvider')
  return context
}
