import CheckoutField from '@/components/checkout/CheckoutField';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';
import type { CheckoutProfileForm } from '@/components/checkout/types';

export default function CheckoutCustomerStep({
  form,
  onChange,
}: {
  form: CheckoutProfileForm
  onChange: (field: keyof CheckoutProfileForm, value: string) => void
}) {
  return (
    <CheckoutSectionCard
      title="Customer"
      description="These details are prefilled when available, and you can edit or add anything missing."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <CheckoutField label="First Name" value={form.first_name} onChange={(value) => onChange('first_name', value)} placeholder="Enter first name" />
        <CheckoutField label="Last Name" value={form.last_name} onChange={(value) => onChange('last_name', value)} placeholder="Enter last name" />
        <CheckoutField label="Email" value={form.email} onChange={(value) => onChange('email', value)} type="email" placeholder="Enter email" />
        <CheckoutField label="Phone" value={form.phone} onChange={(value) => onChange('phone', value)} placeholder="Enter phone number" />
      </div>
    </CheckoutSectionCard>
  );
}
