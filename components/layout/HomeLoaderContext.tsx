'use client';

import { createContext, useContext } from 'react';
import type { Context } from 'react';

export type HomeLoaderContextValue = {
  isHomeLoading: boolean;
  setIsHomeLoading: (value: boolean) => void;
  isHomeReady: boolean;
  setIsHomeReady: (value: boolean) => void;
};

// Keep the provider and consumer on the same context instance when Turbopack
// reloads one client module without reloading the other.
const contextStore = globalThis as typeof globalThis & {
  __hodHomeLoaderContext?: Context<HomeLoaderContextValue | null>;
};
const HomeLoaderContext = contextStore.__hodHomeLoaderContext ??
  (contextStore.__hodHomeLoaderContext = createContext<HomeLoaderContextValue | null>(null));

export function HomeLoaderProvider({
  value,
  children,
}: {
  value: HomeLoaderContextValue;
  children: React.ReactNode;
}) {
  return <HomeLoaderContext.Provider value={value}>{children}</HomeLoaderContext.Provider>;
}

export function useHomeLoader() {
  const context = useContext(HomeLoaderContext);
  if (!context) {
    throw new Error('useHomeLoader must be used within HomeLoaderProvider.');
  }
  return context;
}
