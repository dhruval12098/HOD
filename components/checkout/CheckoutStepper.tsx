const STEPS = ['Customer', 'Shipping', 'Delivery', 'Payment', 'Review'];

export default function CheckoutStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="rounded-[24px] border border-[#e7ebf0] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        {STEPS.map((step, index) => (
          <div key={step} className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                index <= currentStep
                  ? 'bg-[#101828] text-white'
                  : 'border border-[#d0d5dd] bg-white text-[#98a2b3]'
              }`}
            >
              {index + 1}
            </div>
            <span className={`text-sm font-medium ${index === currentStep ? 'text-[#101828]' : 'text-[#667085]'}`}>{step}</span>
            {index < STEPS.length - 1 ? <div className={`hidden h-px w-8 sm:block ${index < currentStep ? 'bg-[#101828]' : 'bg-[#d0d5dd]'}`} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
