interface BlogPostBackProps {
  onBack: () => void;
}

export default function BlogPostBack({ onBack }: BlogPostBackProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-[52px] pt-7 max-md:px-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[8px] tracking-[0.2em] uppercase font-medium text-[#0A1628] cursor-pointer bg-none border-none font-['Montserrat',-apple-system,sans-serif] transition-[gap] duration-[250ms] hover:gap-3 p-0"
      >
        ← Back to Journal
      </button>
    </div>
  );
}
