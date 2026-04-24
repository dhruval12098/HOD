'use client'

export type FilterType = 'all' | 'ring' | 'bracelet' | 'chain' | 'pendant' | 'others'

interface TypeFilterBarProps {
  active: FilterType
  onChange: (type: FilterType) => void
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Rings', value: 'ring' },
  { label: 'Bracelets', value: 'bracelet' },
  { label: 'Chains', value: 'chain' },
  { label: 'Pendants', value: 'pendant' },
  { label: 'Others', value: 'others' },
]

export default function TypeFilterBar({ active, onChange }: TypeFilterBarProps) {
  return (
    <div className="reveal flex flex-wrap gap-2 justify-center mb-12">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`
            px-[18px] py-2
            text-[9px] font-normal tracking-[0.24em] uppercase
            border cursor-pointer
            transition-all duration-300
            ${
              active === f.value
                ? 'border-white/55 bg-white/10 text-white'
                : 'text-white/65 border-white/20 hover:text-white hover:border-white/45'
            }
          `}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
