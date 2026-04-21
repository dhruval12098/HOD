'use client'

import { useEffect } from 'react'

export function useRevealAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    )

    const elements = document.querySelectorAll('.reveal:not(.in-view)')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}
