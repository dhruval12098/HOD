'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'hod_wishlist';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWishlist(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (next: number[]) => {
    setWishlist(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const toggle = useCallback((id: number): 'added' | 'removed' => {
    let result: 'added' | 'removed';
    setWishlist(prev => {
      const idx = prev.indexOf(id);
      if (idx > -1) {
        result = 'removed';
        const next = prev.filter(x => x !== id);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      } else {
        result = 'added';
        const next = [...prev, id];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      }
    });
    return result!;
  }, []);

  const isInWishlist = useCallback((id: number) => wishlist.includes(id), [wishlist]);

  return { wishlist, toggle, isInWishlist, count: wishlist.length };
}
