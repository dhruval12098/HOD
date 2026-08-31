'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { buildCartItemKey, getProductKey, type CartItemSelection, type StoredCartItem } from '@/lib/product-keys'

const STORAGE_KEY = 'hod_cart'

type CartContextValue = {
  items: StoredCartItem[]
  count: number
  addItem: (product: { dbId?: string | null; id?: string | number | null; slug?: string | null; name?: string | null; shortMeta?: string | null; imageUrl?: string | null; priceFrom?: number | null }, selection: CartItemSelection) => void
  isHydrated: boolean
  removeItem: (key: string) => void
  clearCart: () => void
  updateQuantity: (key: string, quantity: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<StoredCartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const hasLoadedStoredCart = useRef(false)

  useEffect(() => {
    if (!hasLoadedStoredCart.current) return

    try {
      const serializedItems = JSON.stringify(items)
      if (localStorage.getItem(STORAGE_KEY) !== serializedItems) {
        localStorage.setItem(STORAGE_KEY, serializedItems)
      }
    } catch {}
  }, [items])

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return

      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) setItems(parsed)
        }
      } catch {
        // Ignore unavailable or malformed browser storage and start with an empty cart.
      } finally {
        hasLoadedStoredCart.current = true
        setIsHydrated(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || event.key !== STORAGE_KEY) return

      if (event.newValue === null) {
        setItems([])
        return
      }

      try {
        const parsed = JSON.parse(event.newValue)
        if (Array.isArray(parsed)) setItems(parsed)
      } catch {
        // Ignore malformed changes from other tabs.
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo<CartContextValue>(() => ({
    items,
    isHydrated,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    addItem: (product, selection) => {
      const key = buildCartItemKey(product, selection)
      const productKey = getProductKey(product)
      setItems((currentItems) => {
        const existing = currentItems.find((item) => item.key === key)
        const snapshot = {
          id: String(product.id ?? product.dbId ?? product.slug ?? ''),
          dbId: product.dbId || undefined,
          slug: product.slug || '',
          name: product.name || 'Selected piece',
          shortMeta: product.shortMeta || '',
          imageUrl: selection.resolvedImageUrl || product.imageUrl || '',
          priceFrom: Number(selection.resolvedPrice ?? product.priceFrom ?? 0),
        }
        if (existing) {
          return currentItems.map((item) => (item.key === key ? { ...item, quantity: item.quantity + 1, snapshot } : item))
        }
        return [
          ...currentItems,
          {
            key,
            productKey,
            productSlug: product.slug || '',
            quantity: 1,
            selection,
            addedAt: Date.now(),
            snapshot,
          },
        ]
      })
    },
    removeItem: (key) => setItems((currentItems) => currentItems.filter((item) => item.key !== key)),
    clearCart: () => setItems([]),
    updateQuantity: (key, quantity) => {
      setItems((currentItems) => {
        if (quantity <= 0) {
          return currentItems.filter((item) => item.key !== key)
        }
        return currentItems.map((item) => (item.key === key ? { ...item, quantity } : item))
      })
    },
  }), [isHydrated, items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
