import type { HTMLInputTypeAttribute, InputHTMLAttributes, ReactNode } from 'react'

export default function CheckoutField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  error,
  onBlur,
  inputMode,
  trailing,
  readOnly = false,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  type?: HTMLInputTypeAttribute
  placeholder?: string
  required?: boolean
  error?: string
  onBlur?: () => void
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
  trailing?: ReactNode
  readOnly?: boolean
}) {
  return (
    <div className={`flex h-[64px] items-center border bg-white px-[22px] ${error ? 'border-red-400' : 'border-[#858585]'}`}>
      <div className="sr-only">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </div>
      {onChange ? (
        <div className="flex w-full items-center gap-3">
          <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            inputMode={inputMode}
            placeholder={`${label}${required ? ' *' : ''}`}
            readOnly={readOnly}
            className="checkout-input h-full w-full border-0 bg-transparent p-0 font-[family-name:var(--font-family-montserrat)] text-[18px] font-normal text-[#111111] outline-none placeholder:text-[#707070] placeholder:font-medium placeholder:opacity-100 read-only:cursor-not-allowed read-only:text-[#292727]"
          />
          {trailing ? <div className="flex h-5 w-5 flex-none items-center justify-center text-[#98a2b3]">{trailing}</div> : null}
        </div>
      ) : (
        <div className="w-full font-[family-name:var(--font-family-montserrat)] text-[18px] font-normal text-[#111111]">{value || `${label}${required ? ' *' : ''}`}</div>
      )}
      {error ? <div className="mt-1 text-[10px] text-red-600">{error}</div> : null}
    </div>
  );
}
