'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { StorefrontProduct } from '@/lib/catalog-products';
import { STONE_MAP } from '@/lib/data/product-config';
import EnquireModal from '@/components/home/EnquireModal';
import Loader from '@/components/home/Loader';
import { Toast } from '@/components/home/Toast';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductGallery from '@/components/product/ProductGallery';
import ProductTagLine from '@/components/product/ProductTagLine';
import ProductCategoryPill from '@/components/product/ProductCategoryPill';
import ProductPriceBlock from '@/components/product/ProductPriceBlock';
import ProductDescription from '@/components/product/ProductDescription';
import ProductConfigurator from '@/components/product/ProductConfigurator';
import ProductCTAs from '@/components/product/ProductCTAs';
import ProductTrustRow from '@/components/product/ProductTrustRow';
import ProductTabs from '@/components/product/ProductTabs';
import ProductLayout from '@/components/product/ProductLayout';
import RelatedProducts from '@/components/product/RelatedProducts';

interface ProductClientProps {
  product: StorefrontProduct;
  relatedProducts: StorefrontProduct[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const storefrontProduct = product as StorefrontProduct & {
    hiphopCaratLabel: string;
    hiphopCaratValues: string[];
  };
  const searchParams = useSearchParams();
  const [selectedMetal, setSelectedMetal] = useState(storefrontProduct.metals[0] ?? '');
  const [purity, setPurity] = useState(storefrontProduct.purities[0] ?? '');
  const [selectedHiphopCarat, setSelectedHiphopCarat] = useState(storefrontProduct.hiphopCaratValues[0] ?? '');
  const [sizeOrFit, setSizeOrFit] = useState(storefrontProduct.chainLengthOptions[0] ?? storefrontProduct.fitOptions[0] ?? storefrontProduct.ringSizeNames[0] ?? '');
  const [selectedGemstoneValue, setSelectedGemstoneValue] = useState(storefrontProduct.gemstoneValues[0] ?? '');
  const [engravingMode, setEngravingMode] = useState<'none' | 'custom'>('none');
  const [engravingText, setEngravingText] = useState('');
  const [wishlist, setWishlist] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = JSON.parse(localStorage.getItem('hod_wishlist') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const isDark = product.category === 'hiphop';
  const inWishlist = wishlist.includes(product.id);
  const description = useMemo(
    () => product.descriptionText,
    [product]
  );
  const collectionHref = useMemo(
    () => `/${storefrontProduct.mainCategorySlug || 'fine-jewellery'}`,
    [storefrontProduct.mainCategorySlug]
  );
  const collectionLabel = storefrontProduct.mainCategoryName || 'Collection';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('page-loader-active', pageLoading);
    return () => {
      document.body.classList.remove('page-loader-active');
    };
  }, [pageLoading]);

  useEffect(() => {
    const cacheKey = `hod_product_loader_${product.slug}`;
    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { expiresAt?: number } | null;
        if (parsed?.expiresAt && parsed.expiresAt > Date.now()) {
          setPageLoading(false);
          return;
        }
      }
    } catch {}

    const timer = window.setTimeout(() => setPageLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, [product.slug]);

  const handlePageLoaderComplete = () => {
    setPageLoading(false);
    try {
      window.localStorage.setItem(
        `hod_product_loader_${product.slug}`,
        JSON.stringify({ expiresAt: Date.now() + 1000 * 60 * 60 * 6 })
      );
    } catch {}
  };

  const checkoutHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('slug', product.slug);
    params.set('name', product.name);
    params.set('price', String(product.priceFrom));
    if (product.imageUrl) params.set('image', product.imageUrl);
    if (selectedMetal) params.set('metal', selectedMetal);
    if (purity) params.set('purity', purity);
    if (selectedHiphopCarat) params.set('carat', selectedHiphopCarat);
    if (sizeOrFit) params.set('size', sizeOrFit);
    if (selectedGemstoneValue) params.set('gemstone', selectedGemstoneValue);

    const preserveCategory = searchParams.get('category');
    if (preserveCategory) params.set('category', preserveCategory);

    return `/checkout?${params.toString()}`;
  }, [product.imageUrl, product.name, product.priceFrom, product.slug, purity, searchParams, selectedGemstoneValue, selectedHiphopCarat, selectedMetal, sizeOrFit]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2800);
  };

  const handleWishlistToggle = (id: number) => {
    setWishlist((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('hod_wishlist', JSON.stringify(next));
      } catch {}
      showToast(prev.includes(id) ? 'Removed from wishlist' : 'Saved to wishlist');
      return next;
    });
  };

  const handleMetalChange = (metal: string) => {
    setSelectedMetal(metal);
  };

  const handleEngravingModeChange = (mode: string) => {
    if (mode !== 'none' && mode !== 'custom') return;
    setEngravingMode(mode);
    if (mode === 'none') setEngravingText('');
  };

  const handleRelatedEnquire = (name: string) => {
    if (name) showToast(`Opening enquiry for ${name}`);
    setIsEnquireOpen(true);
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      {pageLoading ? <Loader ready onComplete={handlePageLoaderComplete} /> : null}
      <section className="mx-auto max-w-[1400px] px-[52px] pb-[100px] pt-10 max-[1100px]:px-7 max-[700px]:px-5 max-[700px]:pb-[70px]">
        <ProductBreadcrumb productName={product.name} collectionHref={collectionHref} collectionLabel={collectionLabel} />

        <ProductLayout
          gallery={(
            <ProductGallery
              gemStyle={storefrontProduct.gemStyle}
              gemColor={storefrontProduct.gemColor}
              dark={isDark}
              imageUrl={storefrontProduct.imageUrl}
              galleryUrls={storefrontProduct.galleryUrls}
              videoUrl={storefrontProduct.videoUrl}
            />
          )}
          info={(
            <div>
              <ProductTagLine
                isNew={storefrontProduct.isNew}
                badges={storefrontProduct.hiphopBadges}
                readyToShip={storefrontProduct.readyToShip}
              />
              <ProductCategoryPill
                category={storefrontProduct.mainCategoryName}
                carat={selectedHiphopCarat || storefrontProduct.gemstoneValue || storefrontProduct.optionName || storefrontProduct.subcategoryName || ''}
              />

              <h1 className="mb-[10px] font-serif text-[clamp(36px,4.5vw,56px)] font-light leading-[1.1] tracking-[0.02em] text-[#0A1628]">
                {product.name}
              </h1>

              <div className="mb-6 font-sans text-[10px] font-light uppercase tracking-[0.3em] text-[#6A6A6A] font-numeric">
                {product.shortMeta}
              </div>

              <ProductPriceBlock priceFrom={product.priceFrom} />
              <ProductDescription text={description} />

              <ProductConfigurator
                product={storefrontProduct}
                metal={selectedMetal}
                purity={purity}
                sizeOrFit={sizeOrFit}
                gemstoneValue={selectedGemstoneValue}
                hiphopCarat={selectedHiphopCarat}
                engravingMode={engravingMode}
                engravingText={engravingText}
                onMetalChange={handleMetalChange}
                onPurityChange={setPurity}
                onSizeOrFitChange={setSizeOrFit}
                onGemstoneValueChange={setSelectedGemstoneValue}
                onHiphopCaratChange={setSelectedHiphopCarat}
                onEngravingModeChange={handleEngravingModeChange}
                onEngravingTextChange={setEngravingText}
              />

              <ProductCTAs
                product={product}
                onEnquire={() => setIsEnquireOpen(true)}
                inWishlist={inWishlist}
                onWishlist={() => handleWishlistToggle(product.id)}
                checkoutHref={checkoutHref}
              />

              <ProductTrustRow />
              <ProductTabs
                specifications={product.specificationRows}
                productDetails={product.productDetailRows}
                detailSections={product.detailSections}
                shippingContent={product.shippingContent}
                careWarrantyContent={product.careWarrantyContent}
              />
            </div>
          )}
        />
      </section>

      <RelatedProducts
        products={relatedProducts}
        wishlist={wishlist}
        onWishlist={handleWishlistToggle}
        onEnquire={handleRelatedEnquire}
      />

      <EnquireModal
        open={isEnquireOpen}
        piece={`${product.name}${selectedGemstoneValue ? ` (${selectedGemstoneValue})` : ` (${STONE_MAP[product.stone] ?? product.stone})`}`}
        onClose={() => setIsEnquireOpen(false)}
      />

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}
