import CheckoutField from '@/components/checkout/CheckoutField';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';
import type { CheckoutProfileForm } from '@/components/checkout/types';

export default function CheckoutShippingStep({
  form,
  onChange,
}: {
  form: CheckoutProfileForm
  onChange: (field: keyof CheckoutProfileForm, value: string) => void
}) {
  return (
    <CheckoutSectionCard
      title="Shipping"
      description="Shipping address is prefilled when available, and you can update or complete it here."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <CheckoutField label="Country" value={form.country} onChange={(value) => onChange('country', value)} placeholder="Enter country" />
        <CheckoutField label="State" value={form.state} onChange={(value) => onChange('state', value)} placeholder="Enter state" />
        <CheckoutField label="City" value={form.city} onChange={(value) => onChange('city', value)} placeholder="Enter city" />
        <CheckoutField label="Postal Code" value={form.postal_code} onChange={(value) => onChange('postal_code', value)} placeholder="Enter postal code" />
        <CheckoutField label="Address Line 1" value={form.address_line_1} onChange={(value) => onChange('address_line_1', value)} placeholder="Enter address line 1" />
        <CheckoutField label="Address Line 2" value={form.address_line_2} onChange={(value) => onChange('address_line_2', value)} placeholder="Enter address line 2" />
      </div>
    </CheckoutSectionCard>
  );
}
