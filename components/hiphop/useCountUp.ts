'use client'

import { useEffect } from 'react'

function animateCount(el: HTMLElement) {
  const target = parseInt(el.dataset.count || '0', 10)
  const suffix = el.dataset.suffix || ''
  const duration = 1800
  const start = performance.now()
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    el.textContent =
      Math.floor(target * easeOut(progress)).toLocaleString('en-US') + suffix
    if (progress < 1) {
      requestAnimationFrame(tick)
    } else {
      el.textContent = target.toLocaleString('en-US') + suffix
    }
  }

  requestAnimationFrame(tick)
}

export function useCountUp() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target as HTMLElement)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )

    const elements = document.querySelectorAll<HTMLElement>('[data-count]')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}
