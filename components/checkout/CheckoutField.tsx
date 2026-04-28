export default function CheckoutField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  error,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  error?: string
}) {
  return (
    <div className={`rounded-[18px] border bg-[#fcfcfd] px-4 py-3 ${error ? 'border-red-300' : 'border-[#eaecf0]'}`}>
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#98a2b3]">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </div>
      {onChange ? (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="mt-2 h-10 w-full border-0 bg-transparent p-0 text-sm font-medium text-[#101828] outline-none placeholder:text-[#98a2b3]"
        />
      ) : (
        <div className="mt-2 text-sm font-medium text-[#101828]">{value}</div>
      )}
      {error ? <div className="mt-2 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
