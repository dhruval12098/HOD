import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';

export default function CheckoutDeliveryStep() {
  return (
    <CheckoutSectionCard
      title="Delivery"
      description="Your order timeline and communication details are confirmed here before payment."
    >
      <div className="grid gap-3">
        <div className="rounded-[18px] border border-[#101828] bg-[#f8fafc] px-4 py-4">
          <div className="text-sm font-semibold text-[#101828]">Estimated delivery timeline</div>
          <div className="mt-1 text-sm text-[#667085]">Your piece is expected to be delivered in approximately 3 to 4 weeks.</div>
        </div>
        <div className="rounded-[18px] border border-[#eaecf0] bg-[#fcfcfd] px-4 py-4">
          <div className="text-sm font-semibold text-[#101828]">Order updates</div>
          <div className="mt-1 text-sm text-[#667085]">You will also receive delivery and progress updates by email after the order is placed.</div>
        </div>
      </div>
    </CheckoutSectionCard>
  );
}
