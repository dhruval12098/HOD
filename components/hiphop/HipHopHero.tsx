import Link from 'next/link'

export default function HipHopHero() {
  return (
    <section className="
      px-[52px] pt-20 pb-[50px] text-center
      bg-gradient-to-b from-[#111111] to-[#1A1A1A]
      border-b border-[rgba(184,146,42,0.15)]
      relative overflow-hidden
      md:px-7 sm:px-5
    ">
      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(184,146,42,0.1), transparent)',
        }}
      />

      {/* Breadcrumb */}
      <div className="reveal relative z-10 mb-5 text-[9px] tracking-[0.3em] uppercase text-[#666666]">
        <Link href="/" className="text-[#666666] hover:text-[#D4A840] transition-colors duration-300">
          Home
        </Link>
        <span className="mx-[10px] text-[#444444]">/</span>
        <span className="text-[#E8D898]">Hip Hop</span>
      </div>

      {/* Heading */}
      <h1
        className="
          reveal reveal-delay-1 relative z-10 mb-[14px]
          font-serif font-light text-[#E8D898] tracking-[0.02em] leading-[1.1]
          text-[clamp(46px,6vw,76px)]
        "
      >
        Hip Hop <em className="not-italic text-[#D4A840]">Jewellery</em>
      </h1>

      {/* Sub-heading */}
      <p className="
        reveal reveal-delay-2 relative z-10
        text-[12px] tracking-[0.12em] text-[#888888]
        max-w-[540px] mx-auto leading-[1.8]
      ">
        Fully iced chains, grillz, pendants and statement rings — handcrafted
        with CVD diamonds in 14K and 18K gold.
      </p>
    </section>
  )
}
