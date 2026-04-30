import CheckoutField from '@/components/checkout/CheckoutField';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';
import { formatMoney } from '@/lib/currency';
import type { CheckoutChargeQuote } from '@/components/checkout/types';

export default function CheckoutPaymentStep({
  totalAmount,
  chargeQuote,
}: {
  totalAmount: number
  chargeQuote?: CheckoutChargeQuote | null
}) {
  const payableLabel = chargeQuote
    ? chargeQuote.chargeCurrency === 'USD'
      ? formatMoney(chargeQuote.totalCharged, 'USD')
      : `${formatMoney(chargeQuote.totalCharged, chargeQuote.chargeCurrency)} charged at checkout`
    : formatMoney(totalAmount, 'USD')
  return (
    <CheckoutSectionCard
      title="Payment"
      description="Your catalog pricing stays in USD. The final payment currency is decided safely at checkout."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <CheckoutField label="Payment Method" value="Razorpay Checkout" />
        <CheckoutField label="Billing Address" value="Same as shipping" />
        <CheckoutField label="Gateway" value="Razorpay" />
        <CheckoutField label="Catalog Total" value={formatMoney(totalAmount, 'USD')} />
        <CheckoutField label="Payable Now" value={payableLabel} />
        <CheckoutField label="Payment Currency" value={chargeQuote?.chargeCurrency || 'USD'} />
      </div>
    </CheckoutSectionCard>
  );
}
