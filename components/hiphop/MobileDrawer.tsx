'use client'

import Link from 'next/link'

interface MobileDrawerProps {
  isOpen: boolean
  activeHref?: string
  onEnquire: () => void
}

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Rings', href: '/rings' },
  { label: 'Fine Jewellery', href: '/shop' },
  { label: 'Hip Hop', href: '/hiphop' },
  { label: 'Bespoke', href: '/bespoke' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

export default function MobileDrawer({
  isOpen,
  activeHref,
  onEnquire,
}: MobileDrawerProps) {
  return (
    <div
      className={`
        fixed top-0 right-0 w-full max-w-[420px] h-screen
        bg-[#111111] z-[999] flex flex-col
        pt-[100px] px-10 pb-10
        border-l border-[rgba(184,146,42,0.2)]
        transition-transform duration-500 ease-[cubic-bezier(.77,0,.18,1)]
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`
            block py-[18px]
            font-serif text-[28px] font-normal tracking-[0.05em]
            border-b border-[rgba(184,146,42,0.15)]
            transition-[color,padding-left] duration-300
            ${activeHref === link.href
              ? 'text-[#D4A840]'
              : 'text-[#E8D898] hover:text-[#D4A840] hover:pl-2'
            }
          `}
        >
          {link.label}
        </Link>
      ))}

      <div className="mt-auto pt-10 flex gap-4">
        <button
          onClick={onEnquire}
          className="
            text-[10px] font-sans font-normal tracking-[0.25em] uppercase
            text-[#D4A840] transition-colors duration-300 hover:text-[#E8D898]
          "
        >
          Enquire →
        </button>
      </div>
    </div>
  )
}
