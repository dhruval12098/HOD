// components/product/ConfiguratorPillGroup.jsx — House of Diams

/**
 * A labeled row of pill buttons for the configurator.
 * @param {object}   props
 * @param {string}   props.label         - Row label (uppercase)
 * @param {string}   props.selectedLabel - Italic label shown on the right of the heading
 * @param {string[]} props.options        - Pill options array
 * @param {string}   props.active         - Currently active option value
 * @param {function} props.onChange       - Called with new value
 * @param {boolean}  [props.goldActive]   - Whether to use gold active style instead of ink
 */
export default function ConfiguratorPillGroup({
  label,
  selectedLabel,
  options,
  active,
  onChange,
  goldActive = false,
}) {
  return (
    <div className="mb-5">
      {/* Row heading */}
      <div className="flex justify-between items-baseline mb-[10px]">
        <span className="font-sans text-[10px] font-medium tracking-[0.28em] uppercase text-[#0A1628]">
          {label}
        </span>
        <span className="font-numeric text-[14px] font-normal italic text-[#0A1628] tracking-[0.02em]">
          {selectedLabel}
        </span>
      </div>

      {/* Pills */}
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => {
          const isActive = opt === active;
          const activeClass = goldActive
            ? 'bg-[#0A1628] text-white border-[#0A1628]'
            : 'bg-[#0A1628] text-[#FAFBFD] border-[#0A1628]';

          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`
                rounded-full px-[18px] py-[10px]
                font-sans text-[10px] font-light tracking-[0.16em] uppercase
                border transition-all duration-300 whitespace-nowrap
                ${isActive
                  ? activeClass
                  : 'bg-transparent text-[#253246] border-[rgba(10,22,40,0.10)] hover:border-[#0A1628] hover:text-[#0A1628]'
                }
              `}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
