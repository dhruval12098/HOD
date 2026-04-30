'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { StorefrontProduct } from '@/lib/catalog-products';
import { STONE_MAP } from '@/lib/data/product-config';
import EnquireModal from '@/components/home/EnquireModal';
import { Toast } from '@/components/home/Toast';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductGallery from '@/components/product/ProductGallery';
import ProductTagLine from '@/components/product/ProductTagLine';
import ProductCategoryPill from '@/components/product/ProductCategoryPill';
import ProductPriceBlock from '@/components/product/ProductPriceBlock';
import ProductDescription from '@/components/product/ProductDescription';
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
  const [selectedMetal, setSelectedMetal] = useState(storefrontProduct.metals[0] ?? '');
  const [purity, setPurity] = useState(storefrontProduct.purities[0] ?? '');
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

  const isDark = product.category === 'hiphop';
  const showRingGuide = Boolean(storefrontProduct.ringEnabled || storefrontProduct.type === 'ring');
  const wishlistKey = getProductKey(product);
  const inWishlist = contains(wishlistKey);
  const selectedMetalMeta = storefrontProduct.metalsFull.find((entry) => entry.slug === selectedMetal) || storefrontProduct.metalsFull[0];
  const selectedMaterialValueMeta =
    storefrontProduct.materialValueOptions?.find((entry) => entry.name === selectedGemstoneValue) ||
    storefrontProduct.materialValueOptions?.[0] ||
    null;
  const selectedPurityPriceRow = storefrontProduct.purityPriceRows.find((entry) => entry.purity_label === purity) || storefrontProduct.purityPriceRows[0] || null;
  const selectedMetalMedia = storefrontProduct.metalMediaRows.find((entry) => entry.metal_id === selectedMetalMeta?.id) || storefrontProduct.defaultMetalMedia || null;
  const activeImageUrls = useMemo<string[]>(() => {
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
  }, [selectedMetalMedia, storefrontProduct.galleryUrls, storefrontProduct.imageUrl]);
  const activeVideoUrl = selectedMetalMedia?.video_path || storefrontProduct.videoUrl;
  const activePrice = Number(selectedPurityPriceRow?.price ?? storefrontProduct.priceFrom ?? 0);
  const activeProduct = useMemo(
    () => ({
      ...storefrontProduct,
      priceFrom: activePrice,
      imageUrl: activeImageUrls[0] || storefrontProduct.imageUrl,
      galleryUrls: activeImageUrls.length > 1 ? activeImageUrls.slice(1) : [],
      videoUrl: activeVideoUrl,
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
    const nextDefaultRingSize = activeRingCategory?.sizes?.[0] ?? storefrontProduct.ringSizeNames[0] ?? '';
    if (!nextDefaultRingSize) {
      setSelectedRingSize('');
      return;
    }

    if (!activeRingCategory?.sizes?.includes(selectedRingSize)) {
      setSelectedRingSize(nextDefaultRingSize);
    }
  }, [activeRingCategory, selectedRingSize, storefrontProduct.ringSizeNames]);

  const description = useMemo(
    () => product.descriptionText,
    [product]
  );
  const collectionHref = useMemo(
    () => `/${storefrontProduct.mainCategorySlug || 'fine-jewellery'}`,
    [storefrontProduct.mainCategorySlug]
  );
  const collectionLabel = storefrontProduct.mainCategoryName || 'Collection';

  const checkoutHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('slug', product.slug);
    params.set('name', product.name);
    params.set('price', String(activePrice));
    if (activeProduct.imageUrl) params.set('image', activeProduct.imageUrl);
    if (selectedMetal) params.set('metal', selectedMetal);
    if (purity) params.set('purity', purity);
    if (selectedHiphopCarat) params.set('carat', selectedHiphopCarat);
    if (sizeOrFit) params.set('size', sizeOrFit);
    if (selectedRingSize) params.set('ring_size', selectedRingSize);
    if (selectedGemstoneValue) params.set('gemstone', selectedGemstoneValue);
    if (selectedShapeSlug) params.set('shape', selectedShapeSlug);

    const preserveCategory = searchParams.get('category');
    if (preserveCategory) params.set('category', preserveCategory);

    return `/checkout?${params.toString()}`;
  }, [activePrice, activeProduct.imageUrl, product.name, product.slug, purity, searchParams, selectedGemstoneValue, selectedHiphopCarat, selectedMetal, selectedRingSize, selectedShapeSlug, sizeOrFit]);

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
    metal: selectedMetal,
    purity,
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
      <div className="min-h-screen bg-(--bg) text-(--ink)">
        <section className="mx-auto max-w-[1400px] px-[52px] pb-[100px] pt-10 max-[1100px]:px-7 max-[700px]:px-5 max-[700px]:pb-[70px]">
        <ProductBreadcrumb productName={product.name} collectionHref={collectionHref} collectionLabel={collectionLabel} />

        <ProductLayout
              gallery={(
            <ProductGallery
              gemStyle={storefrontProduct.gemStyle}
              gemColor={storefrontProduct.gemColor}
              dark={isDark}
              imageUrl={activeProduct.imageUrl}
              galleryUrls={activeProduct.galleryUrls}
              videoUrl={activeProduct.videoUrl}
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

              <h1 className="font-display-title mb-[10px] text-[clamp(36px,4.5vw,56px)] font-normal leading-[1.1] tracking-[0.01em] text-[#0A1628]">
                {product.name}
              </h1>

              <div className="mb-6 font-sans text-[10px] font-light uppercase tracking-[0.3em] text-[#6A6A6A] font-numeric">
                {product.shortMeta}
              </div>

              <ProductPriceBlock priceFrom={activePrice} />
              <ProductDescription text={description} />

              <ProductConfigurator
                product={configuredProduct}
                metal={selectedMetal}
                purity={purity}
                sizeOrFit={sizeOrFit}
                ringSize={selectedRingSize}
                gemstoneValue={selectedGemstoneValue}
                shapeSlug={selectedShapeSlug}
                hiphopCarat={selectedHiphopCarat}
                engravingMode={engravingMode}
                engravingText={engravingText}
                onMetalChange={handleMetalChange}
                onPurityChange={setPurity}
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

              <ProductCTAs
                product={activeProduct}
                ctaMode={selectedMaterialValueMeta?.ctaMode || 'both'}
                ctaLabel={selectedMaterialValueMeta?.ctaLabel || null}
                onEnquire={() => setIsEnquireOpen(true)}
                inWishlist={inWishlist}
                onWishlist={() => handleWishlistToggle(product)}
                onAddToCart={handleAddToCart}
                onCheckout={() => {
                  setLoveLetterIntent('checkout');
                  setIsLoveLetterOpen(true);
                }}
                checkoutHref={checkoutHref}
              />

              {showRingGuide ? <RingGuide /> : null}

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
