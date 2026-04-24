export type GemPlaceholderProps = {
  size?: number
  variant?: 'diamond' | 'star' | 'ellipse' | 'organic' | 'ring'
}

export default function GemPlaceholder({ size = 96, variant = 'diamond' }: GemPlaceholderProps) {
  const baseStyle = { width: size, height: size }

  if (variant === 'ring') {
    return (
      <div
        style={baseStyle}
        className="rounded-full border-[10px] border-white/80 shadow-[0_0_28px_rgba(255,255,255,0.24)]"
      />
    )
  }

  if (variant === 'ellipse') {
    return (
      <div
        style={{ width: size * 0.74, height: size, borderRadius: '999px' }}
        className="border border-white/80 bg-white/10 shadow-[0_0_28px_rgba(255,255,255,0.2)] backdrop-blur-sm"
      />
    )
  }

  if (variant === 'organic') {
    return (
      <div
        style={{ width: size, height: size, borderRadius: '38% 62% 57% 43% / 42% 39% 61% 58%' }}
        className="border border-white/80 bg-white/10 shadow-[0_0_28px_rgba(255,255,255,0.2)] backdrop-blur-sm"
      />
    )
  }

  if (variant === 'star') {
    return (
      <div
        style={{ ...baseStyle, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
        className="bg-white/15 shadow-[0_0_28px_rgba(255,255,255,0.2)] backdrop-blur-sm"
      />
    )
  }

  return (
    <div
      style={{ ...baseStyle, transform: 'rotate(45deg)' }}
      className="border border-white/80 bg-white/10 shadow-[0_0_28px_rgba(255,255,255,0.2)] backdrop-blur-sm"
    />
  )
}
