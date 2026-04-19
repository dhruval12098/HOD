'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/data/products';
import { PRODUCTS } from '@/lib/data/products';
import {
  SIZE_MAP,
  STONE_MAP,
  getProductDescription,
  getProductSpecs,
  metalCaratFromKey,
} from '@/lib/data/product-config';
import TrustStrip from '@/components/home/TrustStrip';
import EnquireModal from '@/components/home/EnquireModal';
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
  product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
  const [selectedProduct] = useState(product);
  const [selectedMetal, setSelectedMetal] = useState(selectedProduct.metals[0] ?? '');
  const [purity, setPurity] = useState(metalCaratFromKey(selectedProduct.metals[0] ?? ''));
  const [diamondType, setDiamondType] = useState(
    selectedProduct.stone?.startsWith('natural') ? 'Natural' : 'CVD Lab-Grown',
  );
  const [carat, setCarat] = useState(selectedProduct.carat);
  const [size, setSize] = useState((SIZE_MAP[selectedProduct.type]?.opts ?? ['Made to measure'])[0]);
  const [engravingMode, setEngravingMode] = useState<'none' | 'custom'>('none');
  const [engravingText, setEngravingText] = useState('');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [activeRelatedProducts, setActiveRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('hod_wishlist') || '[]');
      if (Array.isArray(saved)) setWishlist(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const defaults = SIZE_MAP[selectedProduct.type]?.opts ?? ['Made to measure'];
    setSelectedMetal(selectedProduct.metals[0] ?? '');
    setPurity(metalCaratFromKey(selectedProduct.metals[0] ?? ''));
    setDiamondType(selectedProduct.stone?.startsWith('natural') ? 'Natural' : 'CVD Lab-Grown');
    setCarat(selectedProduct.carat);
    setSize(defaults[0]);
    setEngravingMode('none');
    setEngravingText('');
  }, [selectedProduct]);

  useEffect(() => {
    const related = PRODUCTS.filter((item) => (
      item.category === selectedProduct.category && item.id !== selectedProduct.id
    )).slice(0, 4);
    setActiveRelatedProducts(related);
  }, [selectedProduct]);

  const isDark = selectedProduct.category === 'hiphop';
  const inWishlist = wishlist.includes(selectedProduct.id);
  const description = useMemo(() => getProductDescription(selectedProduct), [selectedProduct]);
  const specs = useMemo(() => getProductSpecs(selectedProduct), [selectedProduct]);

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
    setPurity(metalCaratFromKey(metal));
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
      <TrustStrip />

      <section className="mx-auto max-w-[1400px] px-[52px] pb-[100px] pt-10 max-[1100px]:px-7 max-[700px]:px-5 max-[700px]:pb-[70px]">
        <ProductBreadcrumb productName={selectedProduct.name} />

        <ProductLayout
          gallery={(
            <ProductGallery
              gemStyle={selectedProduct.gemStyle}
              gemColor={selectedProduct.gemColor}
              dark={isDark}
              imageUrl={selectedProduct.imageUrl}
              galleryUrls={selectedProduct.galleryUrls}
              videoUrl={selectedProduct.videoUrl}
            />
          )}
          info={(
            <div>
              <ProductTagLine isNew={selectedProduct.isNew} />
              <ProductCategoryPill category={selectedProduct.category} carat={selectedProduct.carat} />

              <h1 className="mb-[10px] font-serif text-[clamp(36px,4.5vw,56px)] font-light leading-[1.1] tracking-[0.02em] text-[#14120D]">
                {selectedProduct.name}
              </h1>

              <div className="mb-6 font-sans text-[10px] font-light uppercase tracking-[0.3em] text-[#7A7060] font-numeric">
                {selectedProduct.shortMeta}
              </div>

              <ProductPriceBlock priceFrom={selectedProduct.priceFrom} />
              <ProductDescription text={description} />

              <ProductConfigurator
                product={selectedProduct}
                metal={selectedMetal}
                purity={purity}
                diamondType={diamondType}
                carat={carat}
                size={size}
                engravingMode={engravingMode}
                engravingText={engravingText}
                onMetalChange={handleMetalChange}
                onPurityChange={setPurity}
                onDiamondTypeChange={setDiamondType}
                onCaratChange={setCarat}
                onSizeChange={setSize}
                onEngravingModeChange={handleEngravingModeChange}
                onEngravingTextChange={setEngravingText}
              />

              <ProductCTAs
                product={selectedProduct}
                onEnquire={() => setIsEnquireOpen(true)}
                inWishlist={inWishlist}
                onWishlist={() => handleWishlistToggle(selectedProduct.id)}
              />

              <ProductTrustRow />
              <ProductTabs specs={specs} />
            </div>
          )}
        />
      </section>

      <RelatedProducts
        products={activeRelatedProducts}
        wishlist={wishlist}
        onWishlist={handleWishlistToggle}
        onEnquire={handleRelatedEnquire}
      />

      <EnquireModal
        open={isEnquireOpen}
        piece={`${selectedProduct.name} (${STONE_MAP[selectedProduct.stone] ?? selectedProduct.stone})`}
        onClose={() => setIsEnquireOpen(false)}
      />

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}
