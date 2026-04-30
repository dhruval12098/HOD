import CheckoutField from '@/components/checkout/CheckoutField';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';

export default function CheckoutPaymentStep({ totalAmount }: { totalAmount: number }) {
  return (
    <CheckoutSectionCard
      title="Payment"
      description="Your payment will be completed securely with Razorpay in the next step."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <CheckoutField label="Payment Method" value="Razorpay Checkout" />
        <CheckoutField label="Billing Address" value="Same as shipping" />
        <CheckoutField label="Gateway" value="Razorpay" />
        <CheckoutField label="Payable Now" value={`₹${Math.round(totalAmount).toLocaleString('en-IN')}`} />
      </div>
    </CheckoutSectionCard>
  );
}
