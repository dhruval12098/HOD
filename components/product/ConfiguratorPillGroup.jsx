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
  options,
  active,
  onChange,
  goldActive = false,
}) {
  return (
    <div className="mb-5">
      <div className="mb-[10px]">
        <span className="font-sans text-[14px] font-semibold text-[var(--color-brand-primary,#000000)]">
          {label}
        </span>
      </div>

      {/* Pills */}
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => {
          const isActive = opt === active;
          const activeClass = goldActive
            ? 'bg-[var(--color-brand-primary,#000000)] text-white border-[var(--color-brand-primary,#000000)]'
            : 'bg-[var(--color-brand-primary,#000000)] text-[#FAFBFD] border-[var(--color-brand-primary,#000000)]';

          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`
                rounded-none px-[14px] py-[8px]
                font-sans text-[11px] font-medium tracking-[0.02em] normal-case
                border transition-all duration-300 whitespace-nowrap
                ${isActive
                  ? activeClass
                  : 'bg-transparent text-[#292727] border-[rgba(10,22,40,0.10)] hover:border-[var(--color-brand-primary,#000000)] hover:text-[var(--color-brand-primary,#000000)]'
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

