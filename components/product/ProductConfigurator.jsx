'use client';

import { useEffect, useId, useRef, useState } from 'react';
import ConfiguratorMetalSwatches from './ConfiguratorMetalSwatches';
import ConfiguratorPillGroup from './ConfiguratorPillGroup';
import ConfiguratorEngravingInput from './ConfiguratorEngravingInput';
import ConfiguratorMaterialButtons from './ConfiguratorMaterialButtons';
import SizeChartDrawer from './SizeChartDrawer';
import { useCurrency } from '@/context/CurrencyContext';
import { METAL_META } from '@/lib/data/product-config';
import { Select } from '@/components/ui/select';
import {
  Select as ShadcnSelect,
  SelectContent as ShadcnSelectContent,
  SelectItem as ShadcnSelectItem,
  SelectTrigger as ShadcnSelectTrigger,
  SelectValue as ShadcnSelectValue,
} from '@/components/ui/shadcn-select';

/**
 * @param {{
 *   product: {
 *     metals: string[]
 *     metalPurityVariants?: { id: string, label: string, metalSlug: string, purityLabel?: string | null, baseMetalName?: string | null }[]
 *     chainLengthOptions: string[]
 *     fitOptions: string[]
 *     ringSizeNames: string[]
 *     ringEnabled?: boolean
 *     ringCategoryId?: string
 *     ringCategoryOptions?: { id: string, name: string, sizes: string[] }[]
 *     fitLabel: string
 *     gemstoneLabel: string
 *     gemstoneValue: string
 *     gemstoneValues: string[]
 *     shapesEnabled?: boolean
 *     shapeOptions?: { id: string, name: string, slug: string, iconUrl?: string | null }[]
 *     hiphopCaratLabel: string
 *     hiphopCaratValues: string[]
 *     engravingEnabled: boolean
 *     engravingLabel: string
 *     customDropdowns?: { id: string, name: string, label: string, isRequired: boolean, options: { id: string, label: string, value: string }[] }[]
 *   }
 *   metal: string
 *   variantId?: string
 *   sizeOrFit: string
 *   ringSize: string
 *   gemstoneValue: string
 *   hiphopCarat: string
 *   engravingMode: 'none' | 'custom'
 *   engravingText: string
 *   onMetalChange: (value: string) => void
 *   onVariantChange?: (value: string) => void
 *   onSizeOrFitChange: (value: string) => void
 *   onRingSizeChange?: (value: string) => void
 *   onGemstoneValueChange: (value: string) => void
 *   onShapeChange?: (value: string) => void
 *   onHiphopCaratChange: (value: string) => void
 *   onEngravingModeChange: (value: string) => void
 *   onEngravingTextChange: (value: string) => void
 *   onRingCategoryChange?: (value: string) => void
 *   customSelections?: Record<string, string>
 *   onCustomSelectionChange?: (groupId: string, optionId: string) => void
 * }} props
 */
export default function ProductConfigurator({
  product,
  metal,
  variantId,
  sizeOrFit,
  ringSize,
  gemstoneValue,
  shapeSlug,
  hiphopCarat,
  engravingMode,
  engravingText,
  onMetalChange,
  onVariantChange,
  onSizeOrFitChange,
  onRingSizeChange,
  onGemstoneValueChange,
  onShapeChange,
  onHiphopCaratChange,
  onEngravingModeChange,
  onEngravingTextChange,
  onRingCategoryChange,
  priceFrom,
  metalComposition,
  metalCompositionColor,
  customSelections = {},
  onCustomSelectionChange,
}) {
  const { format } = useCurrency();
  const combinedVariants = product.metalPurityVariants || [];
  const showCombinedVariants = combinedVariants.length > 0;
  const selectedCombinedVariant = combinedVariants.find((entry) => entry.id === variantId) || combinedVariants[0] || null;
  const metalName = product.metalsFull?.find((entry) => entry.slug === metal)?.name || METAL_META[metal]?.name || metal;
  const showMetal = !showCombinedVariants && product.metals.length > 0;
  const showPrimaryFit = product.chainLengthOptions.length > 0 || product.fitOptions.length > 0;
  const showRingSelector = Boolean(product.ringEnabled && product.ringSizeNames.length > 0);
  const showGemstoneSelector = product.gemstoneValues.length > 1;
  const showShapeSelector = Boolean(product.shapesEnabled && (product.shapeOptions || []).length > 0);
  const showHiphopCaratSelector = product.hiphopCaratValues.length > 0;
  const sizeOptions = product.chainLengthOptions.length > 0
    ? product.chainLengthOptions
    : product.fitOptions.length > 0
      ? product.fitOptions
      : [];
  const sizeLabel = product.chainLengthOptions.length > 0 ? 'Chain Length' : product.fitLabel || 'Fit';
  const [showRingModal, setShowRingModal] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const ringModalTitleId = useId();
  const ringModalRef = useRef(null);
  const ringModalCloseRef = useRef(null);
  const ringModalTriggerRef = useRef(null);
  const [activeRingCategoryId, setActiveRingCategoryId] = useState(product.ringCategoryId || product.ringCategoryOptions?.[0]?.id || '');
  const activeRingCategory = (product.ringCategoryOptions || []).find((entry) => entry.id === activeRingCategoryId) || product.ringCategoryOptions?.[0];
  const ringCategorySizes = activeRingCategory?.sizes || [];
  useEffect(() => {
    setActiveRingCategoryId(product.ringCategoryId || product.ringCategoryOptions?.[0]?.id || '');
  }, [product.ringCategoryId, product.ringCategoryOptions]);

  useEffect(() => {
    if (!showRingModal) return;

    const previousOverflow = document.body.style.overflow;
    const returnFocusNode = ringModalTriggerRef.current;
    document.body.style.overflow = 'hidden';
    ringModalCloseRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowRingModal(false);
        return;
      }

      if (event.defaultPrevented || event.key !== 'Tab' || !ringModalRef.current) return;
      if (!ringModalRef.current.contains(document.activeElement)) return;

      const focusable = Array.from(
        ringModalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        event.preventDefault();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      returnFocusNode?.focus();
    };
  }, [showRingModal]);
  return (
    <div className="mb-5 mt-5 border-y border-[rgba(10,22,40,0.14)] bg-white py-5">
      <div className="mb-4 flex items-center gap-[10px] text-[18px] font-semibold tracking-normal text-[var(--color-brand-primary,#000000)]" style={{ fontFamily: 'var(--font-plus-jakarta), Arial, Helvetica, sans-serif' }}>
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[var(--color-brand-primary,#000000)]" />
        Configure Your Piece
      </div>

      {showCombinedVariants ? (
        <ConfiguratorMaterialButtons
          label="Material"
          selectedLabel={selectedCombinedVariant?.label || ''}
          options={combinedVariants.map((entry) => ({
            value: entry.id,
            label: entry.label,
          }))}
          active={selectedCombinedVariant?.id || ''}
          onChange={(value) => {
            onVariantChange?.(value);
          }}
        />
      ) : null}

      {showMetal ? <ConfiguratorMetalSwatches metals={product.metals} metalOptions={product.metalsFull || []} active={metal} onChange={onMetalChange} /> : null}

      {showGemstoneSelector ? (
        <ConfiguratorPillGroup
          label={product.gemstoneLabel || 'Stone Type'}
          selectedLabel={gemstoneValue}
          options={product.gemstoneValues}
          active={gemstoneValue}
          onChange={onGemstoneValueChange}
        />
      ) : product.gemstoneValue ? (
        <div className="mb-5 px-1 py-2">
          <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-primary,#000000)]">
            {product.gemstoneLabel || 'Stone Type'}
          </div>
          <div className="mt-2 font-sans text-[15px] font-medium text-[var(--color-brand-primary,#000000)]">{gemstoneValue || product.gemstoneValue}</div>
        </div>
      ) : null}

      {showShapeSelector ? (
        <ConfiguratorPillGroup
          label="Shape"
          selectedLabel={product.shapeOptions?.find((entry) => entry.slug === shapeSlug)?.name || product.shapeOptions?.[0]?.name || ''}
          options={(product.shapeOptions || []).map((entry) => entry.name)}
          active={product.shapeOptions?.find((entry) => entry.slug === shapeSlug)?.name || product.shapeOptions?.[0]?.name || ''}
          onChange={(value) => {
            const match = (product.shapeOptions || []).find((entry) => entry.name === value)
            if (match) onShapeChange?.(match.slug)
          }}
        />
      ) : null}

      {showHiphopCaratSelector ? (
        <ConfiguratorPillGroup
          label={product.hiphopCaratLabel || 'Diamond Carat'}
          selectedLabel={hiphopCarat}
          options={product.hiphopCaratValues}
          active={hiphopCarat}
          onChange={onHiphopCaratChange}
        />
      ) : null}

      {showPrimaryFit ? (
        <>
          <ConfiguratorPillGroup
            label={sizeLabel}
            selectedLabel={sizeOrFit}
            options={sizeOptions}
            active={sizeOrFit}
            onChange={onSizeOrFitChange}
          />
        </>
      ) : null}

      {showRingSelector ? (
        <>
          <div className="mb-5">
            <div className="mb-[10px] flex items-baseline justify-between">
              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-primary,#000000)]">
                {activeRingCategory?.name || 'Ring Size'}
              </span>
              <button type="button" onClick={() => setShowSizeChart(true)} className="font-sans text-[13px] font-medium tracking-[0.01em] text-[var(--color-brand-primary,#000000)] underline-offset-4 hover:underline">
                Size Chart
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
              {ringCategorySizes.map((size) => {
                const isActive = size === ringSize;
                return (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => (onRingSizeChange || onSizeOrFitChange)(size)}
                    className={`min-h-11 border px-2 font-[family-name:var(--font-family-button)] text-[10px] font-medium uppercase tracking-[0.12em] transition-colors ${isActive ? 'border-[var(--color-brand-primary,#000000)] bg-[var(--color-brand-primary,#000000)] text-white' : 'border-black/20 bg-white text-[var(--color-brand-primary,#000000)] hover:border-[var(--color-brand-primary,#000000)]'}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
          {product.ringCategoryOptions?.length > 1 ? (
            <button
              ref={ringModalTriggerRef}
              type="button"
              onClick={() => setShowRingModal(true)}
              className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-primary,#000000)] underline underline-offset-4"
            >
              Show Ring Sizes
            </button>
          ) : null}
        </>
      ) : null}

      {(product.customDropdowns || []).map((group) => <div key={group.id} className="mb-5">
        <div className="mb-[10px] flex items-baseline justify-between"><span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-primary,#000000)]">{group.label}{group.isRequired ? ' *' : ''}</span></div>
        <ShadcnSelect value={customSelections[group.id] || undefined} onValueChange={(value) => onCustomSelectionChange?.(group.id, value)}>
          <ShadcnSelectTrigger aria-label={group.label} className="h-12 rounded-none border-[var(--color-brand-primary,#000000)] bg-white font-[family-name:var(--font-family-secondary)] text-[var(--color-brand-primary,#000000)] shadow-none focus:border-[var(--color-brand-primary,#000000)]"><ShadcnSelectValue placeholder={`Select ${group.label}`} /></ShadcnSelectTrigger>
          <ShadcnSelectContent>{group.options.map((option) => <ShadcnSelectItem key={option.id} value={option.id}>{option.label}</ShadcnSelectItem>)}</ShadcnSelectContent>
        </ShadcnSelect>
      </div>)}

      {typeof priceFrom === 'number' ? (
        <div className="mb-6 mt-1 text-center">
          <div className="font-sans text-[17px] font-light tracking-[0.01em] text-[#8B94A5]">Total Price</div>
          <div className="mt-1 text-[30px] font-bold leading-none tracking-[-0.03em] text-[var(--color-brand-primary,#000000)]" style={{ fontFamily: 'var(--font-plus-jakarta), Arial, Helvetica, sans-serif' }}>
            {format(priceFrom)}
          </div>
          <div className="mx-auto mt-4 inline-flex items-center rounded-none border border-black/10 bg-white px-4 py-2 font-sans text-[12px] font-medium text-[var(--color-brand-primary,#000000)]">
            Ships in 3-4 weeks
          </div>
        </div>
      ) : null}

      {product.engravingEnabled ? (
        <ConfiguratorEngravingInput
          label={product.engravingLabel}
          mode={engravingMode}
          text={engravingText}
          onModeChange={onEngravingModeChange}
          onTextChange={onEngravingTextChange}
        />
      ) : null}

      {showRingModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowRingModal(false);
          }}
        >
          <div
            ref={ringModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ringModalTitleId}
            className="w-full max-w-[680px] rounded-none bg-white p-6 shadow-[0_30px_80px_rgba(10,22,40,0.2)]"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 id={ringModalTitleId} className="text-[22px] font-medium text-[var(--color-brand-primary,#000000)]">Ring Categories</h3>
                <p className="mt-1 text-[12px] tracking-[0.08em] text-[#6A6A6A]">Switch category and pick the size you want.</p>
              </div>
              <button ref={ringModalCloseRef} type="button" onClick={() => setShowRingModal(false)} className="rounded-none border border-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-primary,#000000)]">
                Close
              </button>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-primary,#000000)]">Ring Category</label>
              <div className="relative">
                <Select
                  value={activeRingCategoryId}
                  onValueChange={(value) => {
                    setActiveRingCategoryId(value);
                    onRingCategoryChange?.(value);
                  }}
                  options={(product.ringCategoryOptions || []).map((entry) => ({
                    value: entry.id,
                    label: entry.name,
                  }))}
                  validationLabel="Ring category"
                  triggerClassName="bg-[#FCFCFA] text-[14px] font-medium text-[var(--color-brand-primary,#000000)] shadow-[0_8px_28px_rgba(10,22,40,0.06)] focus:shadow-[0_14px_36px_rgba(10,22,40,0.1)]"
                />
              </div>
            </div>

            <div className="mb-5">
              <div className="mb-[10px] flex items-baseline justify-between">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-primary,#000000)]">
                  {activeRingCategory?.name || 'Ring Size'}
                </span>
                <button type="button" onClick={() => setShowSizeChart(true)} className="font-sans text-[13px] font-medium tracking-[0.01em] text-[var(--color-brand-primary,#000000)] underline-offset-4 hover:underline">
                  Size Chart
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
                {ringCategorySizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={size === ringSize}
                    onClick={() => {
                      (onRingSizeChange || onSizeOrFitChange)(size);
                      setShowRingModal(false);
                    }}
                    className={`min-h-11 border px-2 font-[family-name:var(--font-family-button)] text-[10px] font-medium uppercase tracking-[0.12em] transition-colors ${size === ringSize ? 'border-[var(--color-brand-primary,#000000)] bg-[var(--color-brand-primary,#000000)] text-white' : 'border-black/20 bg-white text-[var(--color-brand-primary,#000000)] hover:border-[var(--color-brand-primary,#000000)]'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <SizeChartDrawer open={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </div>
  );
}






