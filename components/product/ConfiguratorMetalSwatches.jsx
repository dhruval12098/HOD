// components/product/ConfiguratorMetalSwatches.jsx — House of Diams

import { METAL_META } from '@/lib/data/product-config';

/**
 * Metal colour swatch selector.
 * @param {object}   props
 * @param {string[]} props.metals  - Array of metal keys e.g. ['18k-rose','18k-white']
 * @param {string}   props.active  - Currently active metal key
 * @param {function} props.onChange - Called with new metal key
 */
export default function ConfiguratorMetalSwatches({ metals, active, onChange }) {
  return (
    <div className="mb-5">
      {/* Row heading */}
      <div className="flex justify-between items-baseline mb-[10px]">
        <span className="font-sans text-[10px] font-medium tracking-[0.28em] uppercase text-[#14120D]">
          Metal
        </span>
        <span className="font-serif text-[14px] font-normal italic text-[#B8922A] tracking-[0.02em]">
          {METAL_META[active]?.name || active}
        </span>
      </div>

      {/* Swatches */}
      <div className="flex gap-[10px] flex-wrap">
        {metals.map(m => {
          const meta = METAL_META[m] || { name: m, color: '#ccc' };
          const isActive = m === active;

          return (
            <button
              key={m}
              onClick={() => onChange(m)}
              className={`
                flex flex-col items-center gap-[6px]
                px-3 pt-[10px] pb-2 min-w-[72px]
                border bg-white transition-all duration-300
                ${isActive
                  ? 'border-[#B8922A] bg-[#F5EDD6] shadow-[0_0_0_1px_#B8922A_inset]'
                  : 'border-[rgba(20,18,13,0.10)] hover:border-[#B8922A]'
                }
              `}
              aria-label={meta.name}
            >
              {/* Colour circle */}
              <span
                className="w-[30px] h-[30px] rounded-full block"
                style={{
                  background: meta.color,
                  boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.08)',
                }}
              />
              {/* Label */}
              <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#3A3628] text-center leading-[1.3]">
                {meta.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
