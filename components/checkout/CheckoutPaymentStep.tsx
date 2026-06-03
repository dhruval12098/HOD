import CheckoutField from '@/components/checkout/CheckoutField';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';
import { useCurrency } from '@/context/CurrencyContext';
import { formatMoney } from '@/lib/currency';
import type { CheckoutChargeQuote } from '@/components/checkout/types';

export default function CheckoutPaymentStep({
  totalAmount,
  chargeQuote,
}: {
  totalAmount: number
  chargeQuote?: CheckoutChargeQuote | null
}) {
  const { format, currencyCode } = useCurrency();
  const payableLabel = chargeQuote
    ? `${formatMoney(chargeQuote.totalCharged, chargeQuote.chargeCurrency)} charged at checkout`
    : format(totalAmount)
  return (
    <CheckoutSectionCard
      title="Payment"
      description="Your catalog prices convert to your selected currency. The final rate is locked safely at checkout."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <CheckoutField label="Payment Method" value="Razorpay Checkout" />
        <CheckoutField label="Billing Address" value="Same as shipping" />
        <CheckoutField label="Gateway" value="Razorpay" />
        <CheckoutField label="Catalog Total" value={format(totalAmount)} />
        <CheckoutField label="Payable Now" value={payableLabel} />
        <CheckoutField label="Payment Currency" value={chargeQuote?.chargeCurrency || currencyCode} />
      </div>
    </CheckoutSectionCard>
  );
}
