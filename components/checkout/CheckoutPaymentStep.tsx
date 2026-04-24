import CheckoutField from '@/components/checkout/CheckoutField';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';

export default function CheckoutPaymentStep() {
  return (
    <CheckoutSectionCard
      title="Payment"
      description="Payment is display-only right now. No real transaction is processed."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <CheckoutField label="Payment Method" value="Card Payment" />
        <CheckoutField label="Billing Address" value="Same as shipping" />
      </div>
    </CheckoutSectionCard>
  );
}
