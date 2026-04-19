'use client';

import ConfiguratorMetalSwatches from './ConfiguratorMetalSwatches';
import ConfiguratorPillGroup from './ConfiguratorPillGroup';
import ConfiguratorEngravingInput from './ConfiguratorEngravingInput';
import ConfiguratorSummary from './ConfiguratorSummary';
import { METAL_META, SIZE_MAP } from '@/lib/data/product-config';

const PURITY_OPTIONS = ['10K', '14K', '18K', '22K', 'Pt 950', '925 Sterling'];
const DIAMOND_TYPES = ['Natural', 'CVD Lab-Grown'];
const CARAT_OPTIONS = ['0.5 ct', '1.0 ct', '1.5 ct', '2.0 ct', '3.0 ct', '4.0 ct+'];

export default function ProductConfigurator({
  product,
  metal,
  purity,
  diamondType,
  carat,
  size,
  engravingMode,
  engravingText,
  onMetalChange,
  onPurityChange,
  onDiamondTypeChange,
  onCaratChange,
  onSizeChange,
  onEngravingModeChange,
  onEngravingTextChange,
}) {
  const sizeConfig = SIZE_MAP[product.type] || { name: 'Size', opts: ['Made to measure'] };
  const metalName = METAL_META[metal]?.name || metal;

  return (
    <div className="mb-8 mt-7 border border-[rgba(20,18,13,0.10)] bg-white p-7">
      <div className="mb-[6px] flex items-center gap-[10px] font-numeric text-[22px] font-medium tracking-[0.04em] text-[#14120D]">
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[#B8922A]" />
        Configure Your Piece
      </div>
      <p className="mb-6 font-sans text-[10px] font-light tracking-[0.14em] text-[#7A7060]">
        Customise every detail - final quote tailored to your selection
      </p>

      <ConfiguratorMetalSwatches metals={product.metals} active={metal} onChange={onMetalChange} />

      <ConfiguratorPillGroup
        label="Metal Purity"
        selectedLabel={purity}
        options={PURITY_OPTIONS}
        active={purity}
        onChange={onPurityChange}
      />

      <ConfiguratorPillGroup
        label="Diamond Type"
        selectedLabel={diamondType}
        options={DIAMOND_TYPES}
        active={diamondType}
        onChange={onDiamondTypeChange}
        goldActive
      />

      <ConfiguratorPillGroup
        label="Diamond Carat"
        selectedLabel={carat}
        options={CARAT_OPTIONS}
        active={carat}
        onChange={onCaratChange}
      />

      <ConfiguratorPillGroup
        label={sizeConfig.name}
        selectedLabel={size}
        options={sizeConfig.opts}
        active={size}
        onChange={onSizeChange}
      />

      <ConfiguratorEngravingInput
        mode={engravingMode}
        text={engravingText}
        onModeChange={onEngravingModeChange}
        onTextChange={onEngravingTextChange}
      />

      <ConfiguratorSummary metal={metalName} purity={purity} diamondType={diamondType} carat={carat} />
    </div>
  );
}
