'use client'

interface OverlayProps {
  isVisible: boolean
  onClick: () => void
}

export default function Overlay({ isVisible, onClick }: OverlayProps) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={`
        fixed inset-0 bg-black/70 backdrop-blur-[4px] z-[998]
        transition-[opacity,visibility] duration-400
        ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
    />
  )
}
