'use client';

import { createContext, useContext } from 'react';

export type HomeLoaderContextValue = {
  isHomeLoading: boolean;
  setIsHomeLoading: (value: boolean) => void;
};

const HomeLoaderContext = createContext<HomeLoaderContextValue | null>(null);

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
