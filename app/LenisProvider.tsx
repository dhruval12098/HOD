"use client";

import { useEffect } from "react";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let rafId = 0;
    let lenis: any = null;
    let destroyed = false;
    let removeVisibilityListener: (() => void) | undefined;

    const start = async () => {
      if (lenis) return;

      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (reduced) return;

      const mod = await import("lenis");
      if (destroyed) return;

      const Lenis = mod.default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      (window as any).__lenis = lenis;

      const raf = (time: number) => {
        if (!lenis) return;
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      const onVisibilityChange = () => {
        if (!lenis) return;
        if (document.visibilityState === "hidden") {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = 0;
        } else if (!rafId) {
          rafId = requestAnimationFrame(raf);
        }
      };

      document.addEventListener("visibilitychange", onVisibilityChange, { passive: true } as any);
      removeVisibilityListener = () => document.removeEventListener("visibilitychange", onVisibilityChange as any);
    };

    const startOnUser = () => void start();
    window.addEventListener("wheel", startOnUser, { passive: true, once: true });
    window.addEventListener("touchstart", startOnUser, { passive: true, once: true });
    window.addEventListener("keydown", startOnUser, { passive: true, once: true });

    const fallback = setTimeout(() => void start(), 2000);

    return () => {
      destroyed = true;
      clearTimeout(fallback);
      window.removeEventListener("wheel", startOnUser);
      window.removeEventListener("touchstart", startOnUser);
      window.removeEventListener("keydown", startOnUser);

      removeVisibilityListener?.();
      cancelAnimationFrame(rafId);
      if (lenis && (window as any).__lenis === lenis) (window as any).__lenis = undefined;
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
