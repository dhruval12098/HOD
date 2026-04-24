import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';

const OPTIONS = [
  {
    title: 'Standard Insured Shipping',
    detail: '3 to 5 business days',
  },
  {
    title: 'Express Insured Shipping',
    detail: '1 to 2 business days',
  },
];

export default function CheckoutDeliveryStep() {
  return (
    <CheckoutSectionCard
      title="Delivery"
      description="Delivery methods are static placeholders in this version."
    >
      <div className="grid gap-3">
        {OPTIONS.map((option, index) => (
          <div
            key={option.title}
            className={`rounded-[18px] border px-4 py-4 ${
              index === 0 ? 'border-[#101828] bg-[#f8fafc]' : 'border-[#eaecf0] bg-[#fcfcfd]'
            }`}
          >
            <div className="text-sm font-semibold text-[#101828]">{option.title}</div>
            <div className="mt-1 text-sm text-[#667085]">{option.detail}</div>
          </div>
        ))}
      </div>
    </CheckoutSectionCard>
  );
}
