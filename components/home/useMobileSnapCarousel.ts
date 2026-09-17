'use client'

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'

const AUTOPLAY_DELAY = 5000

export function useMobileSnapCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const lastInteractionRef = useRef(0)
  const dragRef = useRef({ active: false, moved: false, startX: 0, startLeft: 0 })

  const pauseAutoplay = useCallback(() => {
    lastInteractionRef.current = Date.now()
  }, [])

  useEffect(() => {
    lastInteractionRef.current = Date.now()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      const scroller = scrollerRef.current
      if (!scroller || dragRef.current.active || Date.now() - lastInteractionRef.current < AUTOPLAY_DELAY) return
      const cards = Array.from(scroller.children) as HTMLElement[]
      if (cards.length < 2) return
      const nextCard = cards.find((card) => card.offsetLeft > scroller.scrollLeft + 8)
      scroller.scrollTo({ left: nextCard?.offsetLeft ?? 0, behavior: 'smooth' })
      lastInteractionRef.current = Date.now()
    }, 250)
    return () => window.clearInterval(timer)
  }, [])

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    pauseAutoplay()
    if (event.pointerType === 'touch') return
    const scroller = scrollerRef.current
    if (!scroller) return
    dragRef.current = { active: true, moved: false, startX: event.clientX, startLeft: scroller.scrollLeft }
    scroller.setPointerCapture(event.pointerId)
  }, [pauseAutoplay])

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (!scroller || !dragRef.current.active) return
    const distance = event.clientX - dragRef.current.startX
    if (Math.abs(distance) > 4) dragRef.current.moved = true
    scroller.scrollLeft = dragRef.current.startLeft - distance
  }, [])

  const finishPointer = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (scroller?.hasPointerCapture(event.pointerId)) scroller.releasePointerCapture(event.pointerId)
    dragRef.current.active = false
    pauseAutoplay()
  }, [pauseAutoplay])

  const onClickCapture = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.moved) return
    event.preventDefault()
    event.stopPropagation()
    dragRef.current.moved = false
  }, [])

  return {
    scrollerRef,
    pauseAutoplay,
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp: finishPointer, onPointerCancel: finishPointer, onClickCapture },
  }
}
