'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { buildCartItemKey, getProductKey, type CartItemSelection, type StoredCartItem } from '@/lib/product-keys'

const STORAGE_KEY = 'hod_cart'

type CartContextValue = {
  items: StoredCartItem[]
  count: number
  addItem: (product: { dbId?: string | null; id?: string | number | null; slug?: string | null }, selection: CartItemSelection) => void
  removeItem: (key: string) => void
  clearCart: () => void
  updateQuantity: (key: string, quantity: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<StoredCartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {}
  }, [])

  const persist = (next: StoredCartItem[]) => {
    setItems(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    addItem: (product, selection) => {
      const key = buildCartItemKey(product, selection)
      const productKey = getProductKey(product)
      persist(
        (() => {
          const existing = items.find((item) => item.key === key)
          if (existing) {
            return items.map((item) => (item.key === key ? { ...item, quantity: item.quantity + 1 } : item))
          }
          return [
            ...items,
            {
              key,
              productKey,
              productSlug: product.slug || '',
              quantity: 1,
              selection,
              addedAt: Date.now(),
            },
          ]
        })()
      )
    },
    removeItem: (key) => persist(items.filter((item) => item.key !== key)),
    clearCart: () => persist([]),
    updateQuantity: (key, quantity) => {
      if (quantity <= 0) {
        persist(items.filter((item) => item.key !== key))
        return
      }
      persist(items.map((item) => (item.key === key ? { ...item, quantity } : item)))
    },
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
