'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export default function ViewportDeferred({ children, minHeight = 360 }: { children: ReactNode; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible || !ref.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setVisible(true)
      observer.disconnect()
    }, { rootMargin: '700px 0px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [visible])

  return <div ref={ref} style={visible ? undefined : { minHeight }}>{visible ? children : null}</div>
}
