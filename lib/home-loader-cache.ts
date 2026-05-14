'use client';

export const HOME_LOADER_CACHE_KEY = 'hod_home_loader_v1';
export const HOME_LOADER_CACHE_TTL_MS = 1000 * 60 * 60 * 12;

export function shouldSkipHomeLoader() {
  if (typeof window === 'undefined') return false;

  try {
    const cached = window.localStorage.getItem(HOME_LOADER_CACHE_KEY);
    if (!cached) return false;

    const parsed = JSON.parse(cached) as { expiresAt?: number } | null;
    return Boolean(parsed?.expiresAt && parsed.expiresAt > Date.now());
  } catch {
    return false;
  }
}

export function persistHomeLoaderCache() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      HOME_LOADER_CACHE_KEY,
      JSON.stringify({ expiresAt: Date.now() + HOME_LOADER_CACHE_TTL_MS })
    );
  } catch {}
}
