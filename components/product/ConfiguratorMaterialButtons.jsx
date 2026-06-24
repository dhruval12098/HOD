import { METAL_META } from '@/lib/data/product-config';

const FALLBACK_COLORS = {
  white: ['#E8E8E8', '#BFBFBF', '#9A9A9A', '#F5F5F5', '#B0B0B0', '#808080'],
  yellow: ['#F4D77A', '#D4A93A', '#A77E1A', '#F8E59A', '#B58A20', '#C3990D'],
  rose: ['#F5C2B5', '#E89B8A', '#C26B5A', '#F8D2C7', '#CC7866', '#E16767'],
  platinum: ['#EAEAEA', '#C8C8C8', '#A0A0A0', '#F2F2F2', '#B5B5B5', '#808080'],
  default: ['#E9E0D1', '#C7B083', '#8F7442', '#F4E6C7', '#A8864D', '#8F7442'],
};

function getMaterialParts(label = '', fallbackColor) {
  const normalized = label.toLowerCase();
  const purityMatch = label.match(/\b(10k|12k|14k|18k|22k|24k|pt|platinum)\b/i);
  const purity = normalized.includes('platinum') ? 'PT' : (purityMatch?.[1] || '').toUpperCase();
  const baseName = label
    .replace(/\b(10k|12k|14k|18k|22k|24k|pt)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim() || label;
  const family = normalized.includes('platinum')
    ? 'platinum'
    : normalized.includes('rose')
      ? 'rose'
      : normalized.includes('yellow')
        ? 'yellow'
        : normalized.includes('white')
          ? 'white'
          : 'default';

  if (fallbackColor && family === 'default') {
    return {
      purity: purity || ' ',
      baseName,
      colors: [fallbackColor, fallbackColor, fallbackColor, '#FFFFFF', fallbackColor, fallbackColor],
    };
  }

  return { purity: purity || ' ', baseName, colors: FALLBACK_COLORS[family] || FALLBACK_COLORS.default };
}

function MaterialIcon({ label, color, id }) {
  const { purity, colors } = getMaterialParts(label, color);
  const gradOne = `material-${id}-one`;
  const gradTwo = `material-${id}-two`;

  return (
    <svg viewBox="0 0 37 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={gradOne} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="0.5" stopColor={colors[1]} />
          <stop offset="1" stopColor={colors[2]} />
        </linearGradient>
        <linearGradient id={gradTwo} x1="36" y1="0" x2="0" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={colors[3]} />
          <stop offset="1" stopColor={colors[4]} />
        </linearGradient>
      </defs>
      <circle cx="18.5" cy="18" r="14.75" stroke={`url(#${gradOne})`} strokeWidth="1.5" />
      <circle cx="18.5" cy="18" r="13.25" stroke={`url(#${gradTwo})`} strokeWidth="1.5" />
      <text x="18.5" y="18.5" textAnchor="middle" dominantBaseline="central" fill={colors[5]} fontFamily="inherit" fontSize="8.5" fontWeight="600" letterSpacing="-0.2">
        {purity}
      </text>
    </svg>
  );
}

export default function ConfiguratorMaterialButtons({ label = 'Material', selectedLabel, options, active, onChange }) {
  return (
    <div className="mb-5">
      <div className="mb-3 text-[14px] text-[#0A1628]">
        <b className="font-semibold">{label}:</b>{' '}
        <span className="text-[#777]">{selectedLabel}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
        {options.map((option, index) => {
          const optionLabel = option.label || option.name || option.value;
          const { baseName } = getMaterialParts(optionLabel, option.color);
          const isActive = option.value === active;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (!isActive) onChange(option.value);
              }}
              className={[
                'flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg bg-white p-1.5 text-[#000] transition-colors sm:h-24 sm:w-24 sm:p-2',
                isActive
                  ? 'border-2 border-[#000]'
                  : 'border border-[#D1D1D1] hover:bg-[#F5F5F5]',
              ].join(' ')}
              aria-pressed={isActive}
              aria-label={optionLabel}
            >
              <span className="block h-9 w-9 sm:h-11 sm:w-11">
                <MaterialIcon label={optionLabel} color={option.color} id={`${index}-${option.value}`.replace(/[^a-zA-Z0-9_-]/g, '')} />
              </span>
              <span className="text-center text-[11px] font-medium leading-[1.15] sm:text-[13px] sm:leading-[1.2]">
                {baseName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function buildMetalButtonOptions(metals, metalOptions = []) {
  return metals.map((metalSlug) => {
    const liveMeta = metalOptions.find((entry) => entry.slug === metalSlug);
    return {
      value: metalSlug,
      label: liveMeta?.name || METAL_META[metalSlug]?.name || metalSlug,
      color: liveMeta?.colorHex || METAL_META[metalSlug]?.color || '#ccc',
    };
  });
}
