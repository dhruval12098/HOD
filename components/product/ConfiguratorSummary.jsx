// components/product/ConfiguratorSummary.jsx — House of Diams

/**
 * "Your Selection" summary bar at the bottom of the configurator.
 * @param {object} props
 * @param {string} props.metal       - Metal name, e.g. '18K Rose'
 * @param {string} props.purity      - Purity, e.g. '18K'
 * @param {string} props.extra       - Generic secondary attribute
 * @param {string} props.fit         - Size or fit
 */
export default function ConfiguratorSummary({ metal, purity, extra, fit }) {
  const parts = [metal, purity, extra, fit].filter(Boolean);

  return (
    <div className="mt-6 pt-5 border-t border-[rgba(10,22,40,0.10)] flex flex-wrap gap-x-6 gap-y-[18px]">
      <div className="flex flex-col gap-[3px] min-w-[100px]">
        <span className="font-sans text-[8px] font-medium tracking-[0.24em] uppercase text-[#7F8898]">
          Your Selection
        </span>
        <span className="font-numeric text-[14px] font-medium text-[#0A1628] leading-[1.2] tracking-[0.02em]">
          {parts.join(' · ')}
        </span>
      </div>
    </div>
  );
}
