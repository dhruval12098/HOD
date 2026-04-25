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
        <span className="font-sans text-[10px] font-semibold tracking-[0.22em] uppercase text-[#0A1628]">
          Metal
        </span>
        <span className="font-sans text-[13px] font-medium text-[#0A1628] tracking-[0.01em]">
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
                min-w-[72px] rounded-[18px] px-3 pt-[10px] pb-2
                border bg-white transition-all duration-300
                ${isActive
                  ? 'border-[#0A1628] bg-[#F5F7FC] shadow-[0_0_0_1px_#0A1628_inset]'
                  : 'border-[rgba(10,22,40,0.10)] hover:border-[#0A1628]'
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
              <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#253246] text-center leading-[1.3]">
                {meta.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
