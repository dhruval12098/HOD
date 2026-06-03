import CheckoutField from '@/components/checkout/CheckoutField';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';
import type { CheckoutPostalAreaOption, CheckoutPostalLookupState, CheckoutProfileForm } from '@/components/checkout/types';

export default function CheckoutShippingStep({
  form,
  onChange,
  errors = {},
  postalLookup,
  onPostalBlur,
  postalAreaOptions = [],
  onPostalAreaSelect,
}: {
  form: CheckoutProfileForm
  onChange: (field: keyof CheckoutProfileForm, value: string) => void
  errors?: Partial<Record<keyof CheckoutProfileForm, string>>
  postalLookup?: CheckoutPostalLookupState | null
  onPostalBlur?: () => void
  postalAreaOptions?: CheckoutPostalAreaOption[]
  onPostalAreaSelect?: (id: string) => void
}) {
  return (
    <CheckoutSectionCard
      title="Shipping"
      description="Shipping address is prefilled when available, and you can update or complete it here."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <CheckoutField label="Country" value={form.country} onChange={(value) => onChange('country', value)} placeholder="Enter country" required error={errors.country} />
        <CheckoutField label="State / Province / Region" value={form.state} onChange={(value) => onChange('state', value)} placeholder="Enter state, province, or region" required error={errors.state} />
        <CheckoutField label="District" value={form.district} onChange={(value) => onChange('district', value)} placeholder="Enter district" />
        <CheckoutField label="City" value={form.city} onChange={(value) => onChange('city', value)} placeholder="Enter city" required error={errors.city} />
        <CheckoutField
          label="Postal Code / Pincode"
          value={form.postal_code}
          onChange={(value) => onChange('postal_code', value)}
          onBlur={onPostalBlur}
          placeholder="Enter postal code or pincode"
          required
          error={errors.postal_code}
          trailing={
            postalLookup?.status === 'loading' ? (
              <span
                className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-[#d0d5dd] border-t-[#101828]"
                aria-hidden="true"
              />
            ) : postalLookup?.status === 'success' ? (
              <span className="text-base font-semibold text-[#12b76a]" aria-hidden="true">✓</span>
            ) : postalLookup?.status === 'error' ? (
              <span className="text-base font-semibold text-red-600" aria-hidden="true">×</span>
            ) : null
          }
        />
        <CheckoutField label="Address Line 1" value={form.address_line_1} onChange={(value) => onChange('address_line_1', value)} placeholder="Enter address line 1" required error={errors.address_line_1} />
        <CheckoutField label="Address Line 2" value={form.address_line_2} onChange={(value) => onChange('address_line_2', value)} placeholder="Apartment, suite, company, landmark (optional)" />
      </div>
      {postalAreaOptions.length > 1 ? (
        <label className="mt-4 block rounded-[16px] border border-[#eaecf0] bg-[#fcfcfd] px-4 py-3">
          <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-[#98a2b3]">
            Select Post Office / Area
          </span>
          <select
            className="checkout-input mt-2 h-10 w-full border-0 bg-transparent p-0 text-sm font-medium text-[#101828] outline-none"
            onChange={(event) => onPostalAreaSelect?.(event.target.value)}
            defaultValue={postalAreaOptions[0]?.id}
          >
            {postalAreaOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {postalLookup?.message ? (
        <div
          className={`mt-4 rounded-[16px] border px-4 py-3 text-sm ${
            postalLookup.status === 'error'
              ? 'border-[rgba(220,38,38,0.18)] bg-[rgba(254,242,242,0.9)] text-red-700'
              : postalLookup.status === 'success'
                ? 'border-[rgba(18,183,106,0.18)] bg-[rgba(236,253,243,0.9)] text-[#027a48]'
                : 'border-[#e4e7ec] bg-[#f8fafc] text-[#475467]'
          }`}
        >
          {postalLookup.message}
        </div>
      ) : null}
    </CheckoutSectionCard>
  );
}
