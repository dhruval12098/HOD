// components/product/RelatedProducts.jsx — House of Diams

import GemSVG from '../common/GemSVG';

/**
 * "You May Also Love" related products grid.
 * @param {object}   props
 * @param {object[]} props.products   - Array of related product objects
 * @param {number[]} props.wishlist   - Array of wishlisted product IDs
 * @param {function} props.onWishlist - (id) => void
 * @param {function} props.onEnquire  - (name) => void
 */
export default function RelatedProducts({ products, wishlist = [], onWishlist, onEnquire }) {
  return (
    <section className="px-[52px] py-[80px] max-w-[1400px] mx-auto max-[1100px]:px-7 max-[700px]:px-5 max-[700px]:py-[60px]">
      <h2 className="font-serif text-[clamp(40px,5.5vw,72px)] font-light tracking-[0.02em] text-[#14120D] leading-[1.05] mb-12 text-center">
        You May Also <em className="italic text-[#B8922A] font-normal">Love</em>
      </h2>

      <div className="grid gap-7 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-[700px]:grid-cols-1">
        {products.map(p => {
          const isDark    = p.category === 'hiphop';
          const isWished  = wishlist.includes(p.id);
          const tag       = p.isNew ? 'New' : p.featured ? 'Featured' : 'Signature';
          const tagClass  = p.category === 'hiphop'
            ? 'bg-[#B8922A] text-[#14120D] border-[#B8922A]'
            : 'bg-white/90 text-[#8A6A10] border-[rgba(184,146,42,0.25)] backdrop-blur-[10px]';
          const svgSize   = ['chain','tennis','grillz','cross'].includes(p.gemStyle) ? 140 : 110;

          return (
            <a
              key={p.id}
              href={`/shop/${p.slug}`}
              aria-label={p.name}
              className={`
                flex flex-col no-underline border cursor-pointer overflow-hidden relative
                transition-all duration-500 ease-[cubic-bezier(.2,.7,.3,1)]
                hover:-translate-y-[6px] hover:shadow-[0_24px_60px_rgba(20,18,13,0.12)] hover:border-[rgba(184,146,42,0.25)]
                ${isDark ? 'bg-[#14120D] border-[rgba(184,146,42,0.18)]' : 'bg-white border-[rgba(20,18,13,0.10)]'}
              `}
            >
              {/* Visual */}
              <div
                className={`
                  h-[300px] flex items-center justify-center relative overflow-hidden
                  ${isDark
                    ? 'bg-gradient-to-br from-[#14120D] to-[#1C1A14]'
                    : 'bg-gradient-to-br from-[#FBF9F5] to-[#F6F2EA]'
                  }
                `}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(184,146,42,0.08),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Tag */}
                <span
                  className={`
                    absolute top-[14px] left-[14px] z-[2]
                    font-sans text-[8px] font-medium tracking-[0.26em] uppercase
                    px-3 py-[5px] border
                    ${tagClass}
                  `}
                >
                  {tag}
                </span>

                {/* Wishlist */}
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); onWishlist?.(p.id); }}
                  aria-label="Add to wishlist"
                  className={`
                    absolute top-[14px] right-[14px] z-[2]
                    w-8 h-8 rounded-full flex items-center justify-center
                    border transition-all duration-300
                    ${isWished
                      ? 'bg-[#B8922A] border-[#B8922A]'
                      : isDark
                        ? 'bg-[rgba(20,18,13,0.7)] border-[rgba(184,146,42,0.3)] hover:bg-[#B8922A] hover:border-[#B8922A]'
                        : 'bg-white/90 border-[rgba(20,18,13,0.10)] backdrop-blur-[10px] hover:bg-[#B8922A] hover:border-[#B8922A]'
                    }
                  `}
                >
                  <svg
                    width="14" height="14" viewBox="0 0 16 16"
                    fill={isWished ? 'currentColor' : 'none'}
                    className={isWished ? 'text-white' : isDark ? 'text-[#D4A840]' : 'text-[#3A3628]'}
                    style={{ stroke: 'currentColor' }}
                  >
                    <path d="M8 14L2.5 8.5C1 7 1 4.5 2.5 3C4 1.5 6.5 1.5 8 3C9.5 1.5 12 1.5 13.5 3C15 4.5 15 7 13.5 8.5L8 14Z" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                </button>

                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={`${p.name} jewellery`}
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] hover:scale-[1.08] hover:rotate-[-3deg]"
                    loading="lazy"
                  />
                ) : (
                  <div className="transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] hover:scale-[1.08] hover:rotate-[-3deg] drop-shadow-[0_8px_20px_rgba(184,146,42,0.2)]">
                    <GemSVG style={p.gemStyle} size={svgSize} color={p.gemColor} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div
                className={`
                  flex-1 flex flex-col gap-[6px] px-[22px] pt-[22px] pb-[26px]
                  border-t
                  ${isDark ? 'border-[rgba(184,146,42,0.12)]' : 'border-[rgba(20,18,13,0.10)]'}
                `}
              >
                <div className={`font-sans text-[9px] font-light tracking-[0.22em] uppercase font-numeric ${isDark ? 'text-[#8A7E5C]' : 'text-[#7A7060]'}`}>
                  {p.shortMeta}
                </div>
                <div className={`font-serif text-[20px] font-normal leading-[1.2] tracking-[0.02em] ${isDark ? 'text-[#F9F6F1]' : 'text-[#14120D]'}`}>
                  {p.name}
                </div>

                {/* Price row */}
                <div className="flex items-center justify-between mt-auto pt-3">
                  <div>
                    <span className={`block font-sans text-[8px] font-light tracking-[0.24em] uppercase font-numeric ${isDark ? 'text-[#7A6F52]' : 'text-[#B0A898]'}`}>
                      From
                    </span>
                    <span className="font-serif text-[18px] font-medium text-[#B8922A] tracking-[0.02em] font-numeric">
                      ${p.priceFrom.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); onEnquire?.(p.name); }}
                    className={`
                      font-sans text-[8px] font-light tracking-[0.24em] uppercase
                      px-[14px] py-[7px] border bg-transparent cursor-pointer
                      transition-all duration-300
                      hover:bg-[#B8922A] hover:text-white hover:border-[#B8922A]
                      ${isDark ? 'border-[rgba(184,146,42,0.3)] text-[#D4A840]' : 'border-[rgba(20,18,13,0.10)] text-[#3A3628]'}
                    `}
                  >
                    Enquire
                  </button>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
