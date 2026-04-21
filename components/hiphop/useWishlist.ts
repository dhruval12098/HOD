'use client'

import { useState, useCallback } from 'react'

const STORAGE_KEY = 'hod_wishlist'

function readStorage(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<number[]>(() => {
    if (typeof window === 'undefined') return []
    return readStorage()
  })

  const toggle = useCallback((id: number) => {
    setWishlist((prev) => {
      const next = prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const isWishlisted = useCallback(
    (id: number) => wishlist.includes(id),
    [wishlist]
  )

  return { wishlist, toggle, isWishlisted, count: wishlist.length }
}
