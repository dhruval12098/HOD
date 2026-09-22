'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ContactDrawerContext = createContext<{ isOpen: boolean; openContact: () => void; closeContact: () => void } | null>(null)

export function ContactDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const current = new URL(window.location.href)
    if (current.searchParams.get('contact') === 'open') {
      setIsOpen(true)
      current.searchParams.delete('contact')
      window.history.replaceState(null, '', `${current.pathname}${current.search}${current.hash}`)
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target as Element | null
      const anchor = target?.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const destination = new URL(anchor.href, window.location.href)
      if (destination.origin !== window.location.origin || destination.pathname.replace(/\/+$/, '') !== '/contact') return
      event.preventDefault()
      setIsOpen(true)
    }

    const close = () => setIsOpen(false)
    document.addEventListener('click', onClick, true)
    window.addEventListener('hod:close-contact', close)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('hod:close-contact', close)
    }
  }, [])

  const value = useMemo(() => ({ isOpen, openContact: () => setIsOpen(true), closeContact: () => setIsOpen(false) }), [isOpen])
  return <ContactDrawerContext.Provider value={value}>{children}</ContactDrawerContext.Provider>
}

export function useContactDrawer() {
  const context = useContext(ContactDrawerContext)
  if (!context) throw new Error('useContactDrawer must be used within ContactDrawerProvider')
  return context
}