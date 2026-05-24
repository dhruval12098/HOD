'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { StorefrontProduct } from '@/lib/catalog-products';
import { STONE_MAP } from '@/lib/data/product-config';
import EnquireModal from '@/components/home/EnquireModal';
import { Toast } from '@/components/home/Toast';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductGallery from '@/components/product/ProductGallery';
import ProductPriceBlock from '@/components/product/ProductPriceBlock';
import ProductDescription from '@/components/product/ProductDescription';
import ProductMetalComposition from '@/components/product/ProductMetalComposition';
import ProductConfigurator from '@/components/product/ProductConfigurator';
import RingGuide from '@/components/product/RingGuide';
import ProductCTAs from '@/components/product/ProductCTAs';
import ProductTrustRow from '@/components/product/ProductTrustRow';
import ProductTabs from '@/components/product/ProductTabs';
import ProductLayout from '@/components/product/ProductLayout';
import RelatedProducts from '@/components/product/RelatedProducts';
import LoveLetterModal from '@/components/product/LoveLetterModal';
import { useWishlistStore } from '@/lib/hooks/useWishlistStore';
import { useCart } from '@/lib/hooks/useCart';
import { getProductKey } from '@/lib/product-keys';
import { saveLoveLetterDraft, type LoveLetterDraft } from '@/lib/love-letter';

interface ProductClientProps {
  product: StorefrontProduct;
  relatedProducts: StorefrontProduct[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const router = useRouter();
  const storefrontProduct = product as StorefrontProduct & {
    hiphopCaratLabel: string;
    hiphopCaratValues: string[];
  };
  const searchParams = useSearchParams();
  const [selectedVariantId, setSelectedVariantId] = useState(
    storefrontProduct.metalPurityVariants.find((entry) => entry.isDefault)?.id ||
      storefrontProduct.metalPurityVariants[0]?.id ||
      ''
  );
  const [selectedMetal, setSelectedMetal] = useState(storefrontProduct.metals[0] ?? '');
  const [selectedHiphopCarat, setSelectedHiphopCarat] = useState(storefrontProduct.hiphopCaratValues[0] ?? '');
  const [selectedRingCategoryId, setSelectedRingCategoryId] = useState(storefrontProduct.ringCategoryId || storefrontProduct.ringCategoryOptions?.[0]?.id || '');
  const activeRingCategory = storefrontProduct.ringCategoryOptions?.find((entry) => entry.id === selectedRingCategoryId) || storefrontProduct.ringCategoryOptions?.[0];
  const [sizeOrFit, setSizeOrFit] = useState(storefrontProduct.chainLengthOptions[0] ?? storefrontProduct.fitOptions[0] ?? storefrontProduct.ringSizeNames[0] ?? '');
  const [selectedRingSize, setSelectedRingSize] = useState(activeRingCategory?.sizes?.[0] ?? storefrontProduct.ringSizeNames[0] ?? '');
  const [selectedGemstoneValue, setSelectedGemstoneValue] = useState(storefrontProduct.gemstoneValues[0] ?? '');
  const [selectedShapeSlug, setSelectedShapeSlug] = useState(storefrontProduct.primaryShapeSlug || storefrontProduct.shapeOptions[0]?.slug || '');
  const [engravingMode, setEngravingMode] = useState<'none' | 'custom'>('none');
  const [engravingText, setEngravingText] = useState('');
  const { wishlist, contains, toggle } = useWishlistStore();
  const { addItem } = useCart();
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [isLoveLetterOpen, setIsLoveLetterOpen] = useState(false);
  const [loveLetterIntent, setLoveLetterIntent] = useState<'cart' | 'checkout' | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [showStickyCartBar, setShowStickyCartBar] = useState(false);
  const ctaAnchorRef = useRef<HTMLDivElement | null>(null);
  const pageTopRef = useRef<HTMLDivElement | null>(null);

  const isDark = product.category === 'hiphop';
  const showRingGuide = Boolean(storefrontProduct.ringEnabled || storefrontProduct.type === 'ring');
  const wishlistKey = getProductKey(product);
  const inWishlist = contains(wishlistKey);
  const selectedCombinedVariant =
    storefrontProduct.metalPurityVariants.find((entry) => entry.id === selectedVariantId) ||
    storefrontProduct.metalPurityVariants.find((entry) => entry.isDefault) ||
    storefrontProduct.metalPurityVariants[0] ||
    null;
  const selectedMetalMeta = storefrontProduct.metalsFull.find((entry) => entry.slug === selectedMetal) || storefrontProduct.metalsFull[0];
  const selectedMaterialValueMeta =
    storefrontProduct.materialValueOptions?.find((entry) => entry.name === selectedGemstoneValue) ||
    storefrontProduct.materialValueOptions?.[0] ||
    null;
  const defaultPurityPriceRow =
    storefrontProduct.purityPriceRows.find((entry) => entry.id === storefrontProduct.defaultPurityPriceId) ||
    storefrontProduct.purityPriceRows[0] ||
    null;
  const selectedMetalMedia = storefrontProduct.metalMediaRows.find((entry) => entry.metal_id === selectedMetalMeta?.id) || storefrontProduct.defaultMetalMedia || null;
  const selectedMetalComposition =
    storefrontProduct.metalCompositions.find((entry) => entry.metalId === selectedMetalMeta?.id) ||
    null;
  const activeImageUrls = useMemo<string[]>(() => {
    if (selectedCombinedVariant) {
      const variantImages = selectedCombinedVariant.mediaItems
        .filter((entry) => entry.type === 'image')
        .map((entry) => entry.url)
        .filter(Boolean);
      const fallbackImages = storefrontProduct.defaultVariantMediaItems
        .filter((entry) => entry.type === 'image')
        .map((entry) => entry.url)
        .filter(Boolean);

      if (variantImages.length > 0) return variantImages;
      if (fallbackImages.length > 0) return fallbackImages;
    }

    const metalImages = selectedMetalMedia
      ? [
          selectedMetalMedia.image_1_path,
          selectedMetalMedia.image_2_path,
          selectedMetalMedia.image_3_path,
          selectedMetalMedia.image_4_path,
        ].filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
      : [];
    return metalImages.length > 0
      ? metalImages
      : [storefrontProduct.imageUrl, ...(storefrontProduct.galleryUrls || [])].filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  }, [selectedCombinedVariant, selectedMetalMedia, storefrontProduct.defaultVariantMediaItems, storefrontProduct.galleryUrls, storefrontProduct.imageUrl]);
  const activeVideoUrl =
    selectedCombinedVariant?.mediaItems.find((entry) => entry.type === 'video')?.url ||
    storefrontProduct.defaultVariantMediaItems.find((entry) => entry.type === 'video')?.url ||
    selectedMetalMedia?.video_path ||
    storefrontProduct.videoUrl;
  const activePrice = Number(selectedCombinedVariant?.price ?? defaultPurityPriceRow?.price ?? storefrontProduct.priceFrom ?? 0);
  const activeProduct = useMemo(
    () => ({
      ...storefrontProduct,
      priceFrom: activePrice,
      imageUrl: activeImageUrls[0] || storefrontProduct.imageUrl,
      galleryUrls: activeImageUrls.length > 1 ? activeImageUrls.slice(1) : [],
      videoUrl: activeVideoUrl,
      model3dUrl: storefrontProduct.model3dUrl,
    }),
    [activeImageUrls, activePrice, activeVideoUrl, storefrontProduct]
  );
  const configuredProduct = useMemo(
    () => ({
      ...activeProduct,
      ringCategoryId: activeRingCategory?.id || storefrontProduct.ringCategoryId,
      ringCategoryName: activeRingCategory?.name || storefrontProduct.ringCategoryName,
      ringSizeNames: storefrontProduct.ringEnabled ? (activeRingCategory?.sizes || storefrontProduct.ringSizeNames) : storefrontProduct.ringSizeNames,
    }),
    [activeProduct, activeRingCategory, storefrontProduct]
  );

  useEffect(() => {
    if (!selectedCombinedVariant) return;
    if (selectedCombinedVariant.metalSlug !== selectedMetal) {
      setSelectedMetal(selectedCombinedVariant.metalSlug);
    }
  }, [selectedCombinedVariant, selectedMetal]);

  useEffect(() => {
    const nextDefaultRingSize = activeRingCategory?.sizes?.[0] ?? storefrontProduct.ringSizeNames[0] ?? '';
    if (!nextDefaultRingSize) {
      setSelectedRingSize('');
      return;
    }

    if (!activeRingCategory?.sizes?.includes(selectedRingSize)) {
      setSelectedRingSize(nextDefaultRingSize);
    }
  }, [activeRingCategory, selectedRingSize, storefrontProduct.ringSizeNames]);

  useEffect(() => {
    const ctaNode = ctaAnchorRef.current;
    const topNode = pageTopRef.current;
    if (!ctaNode || !topNode || typeof window === 'undefined') return;

    const updateStickyBar = () => {
      const topRect = topNode.getBoundingClientRect();
      const ctaRect = ctaNode.getBoundingClientRect();
      const hasScrolledIntoPage = topRect.top < -240;
      const ctaIsPastHeader = ctaRect.bottom < 110;
      setShowStickyCartBar(hasScrolledIntoPage && ctaIsPastHeader);
    };

    updateStickyBar();
    window.addEventListener('scroll', updateStickyBar, { passive: true });
    window.addEventListener('resize', updateStickyBar);
    return () => {
      window.removeEventListener('scroll', updateStickyBar);
      window.removeEventListener('resize', updateStickyBar);
    };
  }, []);

  const description = useMemo(
    () => product.descriptionText,
    [product]
  );
  const collectionHref = useMemo(
    () => `/${storefrontProduct.mainCategorySlug || 'fine-jewellery'}`,
    [storefrontProduct.mainCategorySlug]
  );
  const collectionLabel = storefrontProduct.mainCategoryName || 'Collection';
  const stickySummary = [
    selectedCombinedVariant?.label || selectedMetalMeta?.name,
  ]
    .filter(Boolean)
    .join(' · ');

  const checkoutHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('slug', product.slug);
    params.set('name', product.name);
    params.set('price', String(activePrice));
    if (activeProduct.imageUrl) params.set('image', activeProduct.imageUrl);
    if (selectedVariantId) params.set('variant', selectedVariantId);
    if (selectedCombinedVariant?.label) {
      params.set('metal', selectedCombinedVariant.label);
    } else if (selectedMetalMeta?.name) {
      params.set('metal', selectedMetalMeta.name);
    }
    if (selectedHiphopCarat) params.set('carat', selectedHiphopCarat);
    if (sizeOrFit) params.set('size', sizeOrFit);
    if (selectedRingSize) params.set('ring_size', selectedRingSize);
    if (selectedGemstoneValue) params.set('gemstone', selectedGemstoneValue);
    if (selectedShapeSlug) params.set('shape', selectedShapeSlug);

    const preserveCategory = searchParams.get('category');
    if (preserveCategory) params.set('category', preserveCategory);

    return `/checkout?${params.toString()}`;
  }, [activePrice, activeProduct.imageUrl, product.name, product.slug, searchParams, selectedCombinedVariant?.label, selectedGemstoneValue, selectedHiphopCarat, selectedMetalMeta?.name, selectedRingSize, selectedShapeSlug, selectedVariantId, sizeOrFit]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2800);
  };

  const handleWishlistToggle = (item = product) => {
    const result = toggle(getProductKey(item));
    showToast(result === 'removed' ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  const buildCartSelection = (loveLetterDraft: LoveLetterDraft | null = null) => ({
    metalVariantId: selectedVariantId || undefined,
    metal: selectedCombinedVariant?.label || selectedMetalMeta?.name || selectedMetal,
    metalSlug: selectedCombinedVariant?.metalSlug || selectedMetal,
    purity: '',
    resolvedPrice: activePrice,
    resolvedImageUrl: activeProduct.imageUrl || undefined,
    sizeOrFit,
    ringSize: selectedRingSize,
    ringCategoryId: selectedRingCategoryId,
    gemstone: selectedGemstoneValue,
    shape: selectedShapeSlug,
    hiphopCarat: selectedHiphopCarat,
    engravingMode,
    engravingText,
    loveLetter: loveLetterDraft,
  });

  const handleAddToCart = () => {
    setLoveLetterIntent('cart');
    setIsLoveLetterOpen(true);
  };

  const addConfiguredProductToCart = (loveLetterDraft: LoveLetterDraft | null = null) => {
    addItem(product, {
      ...buildCartSelection(loveLetterDraft),
    });
    showToast('Added to cart');
  }

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

  const handleCheckoutContinue = (draft: LoveLetterDraft) => {
    if (loveLetterIntent === 'cart') {
      addConfiguredProductToCart(draft);
      setIsLoveLetterOpen(false);
      setLoveLetterIntent(null);
      return;
    }

    saveLoveLetterDraft({
      ...draft,
      sourceSlug: product.slug,
    });
    setIsLoveLetterOpen(false);
    setLoveLetterIntent(null);
    router.push(checkoutHref);
  };

    return (
      <div className="hod-product-detail min-h-screen bg-(--bg) text-(--ink)">
      <style>{`
        .hod-product-detail,
        .hod-product-detail .font-sans,
        .hod-product-detail .font-numeric {
          font-family: var(--font-plus-jakarta), Arial, Helvetica, sans-serif !important;
        }

        .hod-product-detail .font-display-title {
          font-family: var(--display-title) !important;
        }
      `}</style>
      <div
        className={`fixed left-0 right-0 top-[40px] z-[45] border-b border-[rgba(10,22,40,0.10)] bg-white/95 backdrop-blur-md transition-transform duration-300 ${
          showStickyCartBar
            ? 'translate-y-0'
            : '-translate-y-[120%] max-[700px]:translate-y-[120%]'
        } max-[700px]:top-auto max-[700px]:bottom-0 max-[700px]:border-b-0 max-[700px]:border-t`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-[52px] py-3 max-[1100px]:px-7 max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-3 max-[700px]:px-5">
          <div className="min-w-0">
            <div className="truncate font-display-title text-[24px] leading-[1.05] text-[#0A1628] max-[700px]:text-[18px]">
              {product.name}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-[#7A8496]">
              {stickySummary ? <span>{stickySummary}</span> : null}
              <span className="font-medium text-[#0A1628]">${activePrice.toLocaleString()}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex min-h-[48px] items-center justify-center rounded-[999px] bg-[#0A1628] px-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#20304A] max-[700px]:w-full"
          >
            Add To Cart
          </button>
        </div>
      </div>

        <section ref={pageTopRef} className="mx-auto max-w-[1400px] px-[52px] pb-[100px] pt-10 max-[1100px]:px-7 max-[700px]:px-5 max-[700px]:pb-[130px]">
        <ProductBreadcrumb
          productName={product.name}
          collectionHref={collectionHref}
          collectionLabel={collectionLabel}
          inWishlist={inWishlist}
          onWishlist={() => handleWishlistToggle(product)}
        />

        <ProductLayout
              gallery={(
            <ProductGallery
              gemStyle={storefrontProduct.gemStyle}
              gemColor={storefrontProduct.gemColor}
              dark={isDark}
              imageUrl={activeProduct.imageUrl}
              galleryUrls={activeProduct.galleryUrls}
              videoUrl={activeProduct.videoUrl}
              model3dUrl={activeProduct.model3dUrl}
            />
          )}
          info={(
            <div>
              <h1 className="font-display-title mb-[10px] text-[clamp(36px,4.5vw,56px)] font-normal leading-[1.1] tracking-[0.01em] text-[#0A1628]">
                {product.name}
              </h1>

              <ProductPriceBlock priceFrom={activePrice} />

              <ProductConfigurator
                product={configuredProduct}
                variantId={selectedVariantId}
                metal={selectedMetal}
                sizeOrFit={sizeOrFit}
                ringSize={selectedRingSize}
                gemstoneValue={selectedGemstoneValue}
                shapeSlug={selectedShapeSlug}
                hiphopCarat={selectedHiphopCarat}
                engravingMode={engravingMode}
                engravingText={engravingText}
                onMetalChange={handleMetalChange}
                onVariantChange={setSelectedVariantId}
                onSizeOrFitChange={setSizeOrFit}
                onRingSizeChange={setSelectedRingSize}
                onGemstoneValueChange={setSelectedGemstoneValue}
                onShapeChange={setSelectedShapeSlug}
                onHiphopCaratChange={setSelectedHiphopCarat}
                onEngravingModeChange={handleEngravingModeChange}
                onEngravingTextChange={setEngravingText}
                onRingCategoryChange={(value: string) => {
                  setSelectedRingCategoryId(value);
                  const nextCategory = storefrontProduct.ringCategoryOptions?.find((entry) => entry.id === value);
                  if (nextCategory?.sizes?.length) setSelectedRingSize(nextCategory.sizes[0]);
                }}
              />

              <div ref={ctaAnchorRef}>
                <ProductCTAs
                  product={activeProduct}
                  ctaMode={selectedMaterialValueMeta?.ctaMode || 'both'}
                  ctaLabel={selectedMaterialValueMeta?.ctaLabel || null}
                  onEnquire={() => setIsEnquireOpen(true)}
                  onAddToCart={handleAddToCart}
                  onCheckout={() => {
                    setLoveLetterIntent('checkout');
                    setIsLoveLetterOpen(true);
                  }}
                  checkoutHref={checkoutHref}
                />
              </div>

              {showRingGuide ? <RingGuide /> : null}

              <ProductTrustRow />
            </div>
          )}
        />
      </section>

      <section className="mx-auto max-w-[1400px] border-t border-[rgba(10,22,40,0.10)] px-[52px] py-12 max-[1100px]:px-7 max-[700px]:px-5">
        <ProductDescription text={description} />
        <h2 className="mb-5 font-display-title text-[28px] font-normal leading-[1.1] tracking-[0.01em] text-[#0A1628]">
          Know Your Setting
        </h2>
        <ProductTabs
          specifications={product.specificationRows}
          productDetails={product.productDetailRows}
          detailSections={product.detailSections}
          showPolicies={false}
        />
        <ProductMetalComposition composition={selectedMetalComposition} fallbackColor={selectedMetalMeta?.colorHex || '#D4AF37'} />
        <ProductTabs
          shippingContent={product.shippingContent}
          careWarrantyContent={product.careWarrantyContent}
          showSections={false}
        />
      </section>

      <RelatedProducts
        products={relatedProducts}
        wishlist={wishlist}
        onWishlist={(relatedProduct: StorefrontProduct) => handleWishlistToggle(relatedProduct)}
        onEnquire={handleRelatedEnquire}
      />

      <EnquireModal
        open={isEnquireOpen}
        piece={`${product.name}${selectedGemstoneValue ? ` (${selectedGemstoneValue})` : ` (${STONE_MAP[product.stone] ?? product.stone})`}`}
        onClose={() => setIsEnquireOpen(false)}
      />
      {isLoveLetterOpen ? (
        <LoveLetterModal
          onClose={() => setIsLoveLetterOpen(false)}
          onContinue={handleCheckoutContinue}
        />
      ) : null}

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}
