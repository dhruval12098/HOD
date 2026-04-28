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
    <section className="mx-auto max-w-[1400px] px-[52px] py-[80px] max-[1100px]:px-7 max-[700px]:px-5 max-[700px]:py-[60px]">
      <h2 className="mb-12 text-center font-serif text-[clamp(40px,5.5vw,72px)] font-light leading-[1.05] tracking-[0.02em] text-[#0A1628]">
        You May Also <em className="font-normal italic text-[#0A1628]">Love</em>
      </h2>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-7 max-[700px]:grid-cols-2 max-[700px]:gap-3">
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
    </section>
  );
}
