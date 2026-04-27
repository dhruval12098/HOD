'use client';

import { useEffect, useState } from 'react';
import ConfiguratorMetalSwatches from './ConfiguratorMetalSwatches';
import ConfiguratorPillGroup from './ConfiguratorPillGroup';
import ConfiguratorEngravingInput from './ConfiguratorEngravingInput';
import ConfiguratorSummary from './ConfiguratorSummary';
import { METAL_META } from '@/lib/data/product-config';
import { Select } from '@/components/ui/select';

/**
 * @param {{
 *   product: {
 *     metals: string[]
 *     purities: string[]
 *     showPurity: boolean
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
 *   }
 *   metal: string
 *   purity: string
 *   sizeOrFit: string
 *   ringSize: string
 *   gemstoneValue: string
 *   hiphopCarat: string
 *   engravingMode: 'none' | 'custom'
 *   engravingText: string
 *   onMetalChange: (value: string) => void
 *   onPurityChange: (value: string) => void
 *   onSizeOrFitChange: (value: string) => void
 *   onRingSizeChange?: (value: string) => void
 *   onGemstoneValueChange: (value: string) => void
 *   onShapeChange?: (value: string) => void
 *   onHiphopCaratChange: (value: string) => void
 *   onEngravingModeChange: (value: string) => void
 *   onEngravingTextChange: (value: string) => void
 *   onRingCategoryChange?: (value: string) => void
 * }} props
 */
export default function ProductConfigurator({
  product,
  metal,
  purity,
  sizeOrFit,
  ringSize,
  gemstoneValue,
  shapeSlug,
  hiphopCarat,
  engravingMode,
  engravingText,
  onMetalChange,
  onPurityChange,
  onSizeOrFitChange,
  onRingSizeChange,
  onGemstoneValueChange,
  onShapeChange,
  onHiphopCaratChange,
  onEngravingModeChange,
  onEngravingTextChange,
  onRingCategoryChange,
}) {
  const metalName = METAL_META[metal]?.name || metal;
  const showMetal = product.metals.length > 0;
  const showPurity = product.showPurity && product.purities.length > 0;
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
  const [activeRingCategoryId, setActiveRingCategoryId] = useState(product.ringCategoryId || product.ringCategoryOptions?.[0]?.id || '');
  const activeRingCategory = (product.ringCategoryOptions || []).find((entry) => entry.id === activeRingCategoryId) || product.ringCategoryOptions?.[0];
  const ringCategorySizes = activeRingCategory?.sizes || [];
  useEffect(() => {
    setActiveRingCategoryId(product.ringCategoryId || product.ringCategoryOptions?.[0]?.id || '');
  }, [product.ringCategoryId, product.ringCategoryOptions]);
  const summaryParts = [
    showShapeSelector ? ['Shape', product.shapeOptions?.find((entry) => entry.slug === shapeSlug)?.name || product.shapeOptions?.[0]?.name || ''].filter(Boolean).join(': ') : '',
    [product.gemstoneLabel, gemstoneValue].filter(Boolean).join(': '),
    hiphopCarat ? `${product.hiphopCaratLabel || 'Diamond Carat'}: ${hiphopCarat}` : '',
  ].filter(Boolean);
  const summaryLabel = summaryParts.join(' · ');

  return (
    <div className="mb-8 mt-7 rounded-[24px] border border-[rgba(10,22,40,0.10)] bg-white p-7 shadow-[0_18px_50px_rgba(10,22,40,0.04)]">
      <div className="mb-[6px] flex items-center gap-[10px] font-numeric text-[22px] font-medium tracking-[0.04em] text-[#0A1628]">
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[#0A1628]" />
        Configure Your Piece
      </div>
      <p className="mb-6 font-sans text-[10px] font-light tracking-[0.14em] text-[#6A6A6A]">
        Configure the live product attributes saved from admin
      </p>

      {showMetal ? <ConfiguratorMetalSwatches metals={product.metals} active={metal} onChange={onMetalChange} /> : null}

      {showPurity ? (
        <ConfiguratorPillGroup
          label="Metal Purity"
          selectedLabel={purity}
          options={product.purities}
          active={purity}
          onChange={onPurityChange}
        />
      ) : null}

      {showGemstoneSelector ? (
        <ConfiguratorPillGroup
          label={product.gemstoneLabel || 'Stone Type'}
          selectedLabel={gemstoneValue}
          options={product.gemstoneValues}
          active={gemstoneValue}
          onChange={onGemstoneValueChange}
        />
      ) : product.gemstoneValue ? (
        <div className="mb-5 rounded-[18px] border border-[rgba(10,22,40,0.10)] bg-[#FAFBFD] px-4 py-3">
          <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0A1628]">
            {product.gemstoneLabel || 'Stone Type'}
          </div>
          <div className="mt-2 font-sans text-[15px] font-medium text-[#0A1628]">{gemstoneValue || product.gemstoneValue}</div>
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
          <ConfiguratorPillGroup
            label={activeRingCategory?.name || 'Ring Size'}
            selectedLabel={ringSize}
            options={ringCategorySizes}
            active={ringSize}
            onChange={onRingSizeChange || onSizeOrFitChange}
          />
          {product.ringCategoryOptions?.length > 1 ? (
            <button
              type="button"
              onClick={() => setShowRingModal(true)}
              className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A1628] underline underline-offset-4"
            >
              Show More Ring Categories
            </button>
          ) : null}
        </>
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

      <ConfiguratorSummary metal={metalName} purity={purity} extra={summaryLabel} fit={sizeOrFit || ringSize} />

      {showRingModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-[680px] rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(10,22,40,0.2)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[22px] font-medium text-[#0A1628]">Ring Categories</h3>
                <p className="mt-1 text-[12px] tracking-[0.08em] text-[#6A6A6A]">Switch category and pick the size you want.</p>
              </div>
              <button type="button" onClick={() => setShowRingModal(false)} className="rounded-full border border-[rgba(10,22,40,0.1)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0A1628]">
                Close
              </button>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0A1628]">Ring Category</label>
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
                  triggerClassName="bg-[#FCFCFA] text-[14px] font-medium text-[#0A1628] shadow-[0_8px_28px_rgba(10,22,40,0.06)] focus:shadow-[0_14px_36px_rgba(10,22,40,0.1)]"
                />
              </div>
            </div>

            <ConfiguratorPillGroup
              label={activeRingCategory?.name || 'Ring Size'}
              selectedLabel={ringSize}
              options={ringCategorySizes}
              active={ringSize}
              onChange={(value) => {
                (onRingSizeChange || onSizeOrFitChange)(value);
                setShowRingModal(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
