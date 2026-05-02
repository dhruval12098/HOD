'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

type UsePageLoaderCacheOptions = {
  cacheKey: string
  ttlMs?: number
  fallbackDelayMs?: number
  bodyClassName?: string
}

export function usePageLoaderCache({
  cacheKey,
  ttlMs = 1000 * 60 * 60 * 6,
  fallbackDelayMs = 220,
  bodyClassName = 'page-loader-active',
}: UsePageLoaderCacheOptions) {
  const [pageLoading, setPageLoading] = useState(true);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle(bodyClassName, pageLoading);
    return () => {
      document.body.classList.remove(bodyClassName);
    };
  }, [bodyClassName, pageLoading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { expiresAt?: number } | null;
        if (parsed?.expiresAt && parsed.expiresAt > Date.now()) {
          setPageLoading(false);
          return;
        }
      }
    } catch {}

    return undefined;
  }, [cacheKey, fallbackDelayMs]);

  const handleLoaderComplete = () => {
    setPageLoading(false);
    try {
      window.localStorage.setItem(cacheKey, JSON.stringify({ expiresAt: Date.now() + ttlMs }));
    } catch {}
  };

  return {
    pageLoading,
    setPageLoading,
    handleLoaderComplete,
  };
}
