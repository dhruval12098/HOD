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
    <div className={`border bg-white px-4 py-2 ${error ? 'border-red-300' : 'border-[#eaecf0]'}`}>
      <div className="text-[9px] font-medium text-[#98a2b3]">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </div>
      {onChange ? (
        <div className="mt-0.5 flex items-center gap-3">
          <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            inputMode={inputMode}
            placeholder={placeholder}
            readOnly={readOnly}
            className="checkout-input h-7 w-full border-0 bg-transparent p-0 text-sm font-medium text-[#101828] outline-none placeholder:text-[#98a2b3] read-only:cursor-not-allowed read-only:text-[#667085]"
          />
          {trailing ? <div className="flex h-5 w-5 flex-none items-center justify-center text-[#98a2b3]">{trailing}</div> : null}
        </div>
      ) : (
        <div className="mt-0.5 text-sm font-medium text-[#101828]">{value}</div>
      )}
      {error ? <div className="mt-1 text-[10px] text-red-600">{error}</div> : null}
    </div>
  );
}
