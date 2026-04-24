'use client';

import ConfiguratorMetalSwatches from './ConfiguratorMetalSwatches';
import ConfiguratorPillGroup from './ConfiguratorPillGroup';
import ConfiguratorEngravingInput from './ConfiguratorEngravingInput';
import ConfiguratorSummary from './ConfiguratorSummary';
import { METAL_META } from '@/lib/data/product-config';

/**
 * @param {{
 *   product: {
 *     metals: string[]
 *     purities: string[]
 *     showPurity: boolean
 *     chainLengthOptions: string[]
 *     fitOptions: string[]
 *     ringSizeNames: string[]
 *     fitLabel: string
 *     gemstoneLabel: string
 *     gemstoneValue: string
 *     gemstoneValues: string[]
 *     hiphopCaratLabel: string
 *     hiphopCaratValues: string[]
 *     engravingEnabled: boolean
 *     engravingLabel: string
 *   }
 *   metal: string
 *   purity: string
 *   sizeOrFit: string
 *   gemstoneValue: string
 *   hiphopCarat: string
 *   engravingMode: 'none' | 'custom'
 *   engravingText: string
 *   onMetalChange: (value: string) => void
 *   onPurityChange: (value: string) => void
 *   onSizeOrFitChange: (value: string) => void
 *   onGemstoneValueChange: (value: string) => void
 *   onHiphopCaratChange: (value: string) => void
 *   onEngravingModeChange: (value: string) => void
 *   onEngravingTextChange: (value: string) => void
 * }} props
 */
export default function ProductConfigurator({
  product,
  metal,
  purity,
  sizeOrFit,
  gemstoneValue,
  hiphopCarat,
  engravingMode,
  engravingText,
  onMetalChange,
  onPurityChange,
  onSizeOrFitChange,
  onGemstoneValueChange,
  onHiphopCaratChange,
  onEngravingModeChange,
  onEngravingTextChange,
}) {
  const metalName = METAL_META[metal]?.name || metal;
  const showMetal = product.metals.length > 0;
  const showPurity = product.showPurity && product.purities.length > 0;
  const showFit = product.chainLengthOptions.length > 0 || product.fitOptions.length > 0 || product.ringSizeNames.length > 0;
  const showGemstoneSelector = product.gemstoneValues.length > 1;
  const showHiphopCaratSelector = product.hiphopCaratValues.length > 0;
  const sizeOptions = product.chainLengthOptions.length > 0
    ? product.chainLengthOptions
    : product.fitOptions.length > 0
      ? product.fitOptions
      : product.ringSizeNames;
  const sizeLabel = product.chainLengthOptions.length > 0 ? 'Chain Length' : product.fitLabel || 'Fit';
  const summaryParts = [
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
          <div className="font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[#0A1628]">
            {product.gemstoneLabel || 'Stone Type'}
          </div>
          <div className="mt-2 font-serif text-[18px] italic text-[#0A1628]">{gemstoneValue || product.gemstoneValue}</div>
        </div>
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

      {showFit ? (
        <ConfiguratorPillGroup
          label={sizeLabel}
          selectedLabel={sizeOrFit}
          options={sizeOptions}
          active={sizeOrFit}
          onChange={onSizeOrFitChange}
        />
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

      <ConfiguratorSummary metal={metalName} purity={purity} extra={summaryLabel} fit={sizeOrFit} />
    </div>
  );
}
