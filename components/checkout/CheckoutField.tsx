export default function CheckoutField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="rounded-[18px] border border-[#eaecf0] bg-[#fcfcfd] px-4 py-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#98a2b3]">{label}</div>
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
    </div>
  );
}
