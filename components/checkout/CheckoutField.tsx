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
    <div className={`rounded-[18px] border bg-[#fcfcfd] px-4 py-3 ${error ? 'border-red-300' : 'border-[#eaecf0]'}`}>
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#98a2b3]">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </div>
      {onChange ? (
        <div className="mt-2 flex items-center gap-3">
          <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            inputMode={inputMode}
            placeholder={placeholder}
            readOnly={readOnly}
            className="checkout-input h-10 w-full border-0 bg-transparent p-0 text-sm font-medium text-[#101828] outline-none placeholder:text-[#98a2b3] read-only:cursor-not-allowed read-only:text-[#667085]"
          />
          {trailing ? <div className="flex h-5 w-5 flex-none items-center justify-center text-[#98a2b3]">{trailing}</div> : null}
        </div>
      ) : (
        <div className="mt-2 text-sm font-medium text-[#101828]">{value}</div>
      )}
      {error ? <div className="mt-2 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
