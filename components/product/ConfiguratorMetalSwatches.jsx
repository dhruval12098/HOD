import { METAL_META } from '@/lib/data/product-config';

export default function ConfiguratorMetalSwatches({ metals, metalOptions = [], active, onChange }) {
  return (
    <div className="mb-5">
      <div className="mb-[10px] flex items-baseline justify-between">
        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0A1628]">
          Metal
        </span>
        <span className="font-sans text-[13px] font-medium tracking-[0.01em] text-[#0A1628]">
          {metalOptions.find((entry) => entry.slug === active)?.name || METAL_META[active]?.name || active}
        </span>
      </div>

      <div className="flex flex-wrap gap-[10px]">
        {metals.map((metalSlug) => {
          const liveMeta = metalOptions.find((entry) => entry.slug === metalSlug);
          const meta = {
            name: liveMeta?.name || METAL_META[metalSlug]?.name || metalSlug,
            color: liveMeta?.colorHex || METAL_META[metalSlug]?.color || '#ccc',
          };
          const isActive = metalSlug === active;

          return (
            <button
              key={metalSlug}
              onClick={() => onChange(metalSlug)}
              className={`
                flex min-w-[72px] flex-col items-center gap-[6px]
                rounded-[18px] border bg-white px-3 pb-2 pt-[10px] transition-all duration-300
                ${
                  isActive
                    ? 'border-[#0A1628] bg-[#F5F7FC] shadow-[0_0_0_1px_#0A1628_inset]'
                    : 'border-[rgba(10,22,40,0.10)] hover:border-[#0A1628]'
                }
              `}
              aria-label={meta.name}
              type="button"
            >
              <span
                className="block h-[30px] w-[30px] rounded-full"
                style={{
                  background: meta.color,
                  boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.08)',
                }}
              />
              <span className="text-center font-sans text-[8px] uppercase tracking-[0.2em] leading-[1.3] text-[#253246]">
                {meta.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
