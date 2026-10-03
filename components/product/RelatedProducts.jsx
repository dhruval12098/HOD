import ProductCard from '@/components/shop/ProductCard';
import { getProductKey } from '@/lib/product-keys';

/**
 * "You May Also Love" related products grid.
 * @param {object} props
 * @param {object[]} props.products
 * @param {string[]} props.wishlist
 * @param {function} props.onWishlist
 * @param {function} props.onEnquire
 */
export default function RelatedProducts({ products, wishlist = [], onWishlist, onEnquire }) {
  return (
    <section className="mx-auto max-w-[1400px] px-[52px] py-[var(--space-section-block)] max-[1100px]:px-7 max-[700px]:px-[10px]">
      <h2 className="mb-[var(--space-section-block)] text-center font-serif text-[clamp(40px,5.5vw,72px)] font-light leading-[1.05] tracking-[0.02em] text-[#0A1628]">
        You May Also <em className="font-normal italic text-[#0A1628]">Love</em>
      </h2>

      <div className="hidden grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 min-[701px]:grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            wishlisted={wishlist.includes(getProductKey(product))}
            onWishlist={() => onWishlist?.(product)}
            onEnquire={onEnquire}
          />
        ))}
      </div>

      <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 min-[701px]:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div key={product.id} className="min-w-[84%] snap-center">
            <ProductCard
              product={product}
              wishlisted={wishlist.includes(getProductKey(product))}
              onWishlist={() => onWishlist?.(product)}
              onEnquire={onEnquire}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
