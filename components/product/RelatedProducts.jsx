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
      <h2 className="font-serif text-[clamp(40px,5.5vw,72px)] font-light tracking-[0.02em] text-[#0A1628] leading-[1.05] mb-12 text-center">
        You May Also <em className="italic text-[#0A1628] font-normal">Love</em>
      </h2>

      <div className="grid gap-7 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-[700px]:grid-cols-1">
        {products.map(p => {
          const isDark    = p.category === 'hiphop';
          const isWished  = wishlist.includes(p.id);
          const tag       = p.isNew ? 'New' : p.featured ? 'Featured' : 'Signature';
          const tagClass  = p.category === 'hiphop'
            ? 'border-white/20 bg-white/10 text-white'
            : 'bg-white/90 text-[#0A1628] border-[rgba(10,22,40,0.25)] backdrop-blur-[10px]';
          const svgSize   = ['chain','tennis','grillz','cross'].includes(p.gemStyle) ? 140 : 110;

          return (
            <a
              key={p.id}
              href={`/shop/${p.slug}`}
              aria-label={p.name}
              className={`
                flex flex-col no-underline border cursor-pointer overflow-hidden relative
                transition-all duration-500 ease-[cubic-bezier(.2,.7,.3,1)]
                hover:-translate-y-[6px] hover:shadow-[0_24px_60px_rgba(10,22,40,0.12)] hover:border-[rgba(10,22,40,0.25)]
                ${isDark ? 'bg-[#0A1628] border-white/12' : 'bg-white border-[rgba(10,22,40,0.10)]'}
              `}
            >
              {/* Visual */}
              <div
                className={`
                  h-[300px] flex items-center justify-center relative overflow-hidden
                  ${isDark
                    ? 'bg-gradient-to-br from-[#0A1628] to-[#111F34]'
                    : 'bg-gradient-to-br from-[#FAFBFD] to-[#FAF7F2]'
                  }
                `}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,22,40,0.08),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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
                      ? 'bg-white border-white text-[#0A1628]'
                      : isDark
                        ? 'bg-black/40 border-white/20 hover:bg-white hover:border-white'
                        : 'bg-white/90 border-[rgba(10,22,40,0.10)] backdrop-blur-[10px] hover:bg-[#0A1628] hover:border-[#0A1628]'
                    }
                  `}
                >
                  <svg
                    width="14" height="14" viewBox="0 0 16 16"
                    fill={isWished ? 'currentColor' : 'none'}
                    className={isWished ? 'text-[#0A1628]' : isDark ? 'text-white' : 'text-[#253246]'}
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
                  <div className="transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] hover:scale-[1.08] hover:rotate-[-3deg] drop-shadow-[0_8px_20px_rgba(10,22,40,0.2)]">
                    <GemSVG style={p.gemStyle} size={svgSize} color={p.gemColor} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div
                className={`
                  flex-1 flex flex-col gap-[6px] px-[22px] pt-[22px] pb-[26px]
                  border-t
                  ${isDark ? 'border-white/12' : 'border-[rgba(10,22,40,0.10)]'}
                `}
              >
                <div className={`font-sans text-[9px] font-light tracking-[0.22em] uppercase font-numeric ${isDark ? 'text-[#6A6A6A]' : 'text-[#6A6A6A]'}`}>
                  {p.shortMeta}
                </div>
                <div className={`font-serif text-[20px] font-normal leading-[1.2] tracking-[0.02em] ${isDark ? 'text-[#FFFFFF]' : 'text-[#0A1628]'}`}>
                  {p.name}
                </div>

                {/* Price row */}
                <div className="flex items-center justify-between mt-auto pt-3">
                  <div>
                    <span className={`block font-sans text-[8px] font-light tracking-[0.24em] uppercase font-numeric ${isDark ? 'text-white/45' : 'text-[#7F8898]'}`}>
                      From
                    </span>
                    <span className={`font-serif text-[18px] font-medium tracking-[0.02em] font-numeric ${isDark ? 'text-white' : 'text-[#0A1628]'}`}>
                      ${p.priceFrom.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); onEnquire?.(p.name); }}
                    className={`
                      font-sans text-[8px] font-light tracking-[0.24em] uppercase
                      px-[14px] py-[7px] border bg-transparent cursor-pointer
                      transition-all duration-300
                      hover:bg-[#0A1628] hover:text-white hover:border-[#0A1628]
                      ${isDark ? 'border-white/24 text-white hover:bg-white hover:text-[#0A1628] hover:border-white' : 'border-[rgba(10,22,40,0.10)] text-[#253246]'}
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
