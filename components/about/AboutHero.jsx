"use client";

export default function AboutHero({ content }) {
  const eyebrow = content?.eyebrow ?? "Our Story";
  const heading = content?.heading ?? "Two Friends.\nOne Vision.";
  const subtitle =
    content?.subtitle ??
    "House of Diams was born in Surat, India — the diamond capital of the world — from the partnership of Krish Babariya and Akshar Korat.";

  return (
    <section
      className="overflow-hidden bg-[linear-gradient(180deg,#FAFBFD_0%,#FAF7F2_100%)] px-5 pb-16 pt-16 sm:px-7 sm:pb-20 sm:pt-20 lg:px-[52px] lg:pb-[80px] lg:pt-[100px]"
    >
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-center lg:gap-[70px]">
        <div className="min-w-0">
          <div className="mb-6 h-px w-[60px] bg-[#0A1628]" />

          <div className="mb-[18px] inline-flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.26em] text-[#0A1628] sm:tracking-[0.32em]">
            <span className="inline-block h-px w-6 bg-[#0A1628]" />
            {eyebrow}
          </div>

          <h1
            className="font-serif text-[#0A1628] whitespace-pre-line leading-[0.98] tracking-[-0.01em]"
            style={{ fontSize: "clamp(42px, 8vw, 104px)", fontWeight: 300 }}
          >
            {heading}
          </h1>

          <p className="mt-7 max-w-[620px] text-[13px] font-light leading-[1.9] tracking-[0.01em] text-[#253246] sm:text-[14px] sm:leading-[2]">
            {subtitle}
          </p>

          <a
            href="/contact"
            className="mt-8 inline-flex items-center gap-[10px] bg-[#0A1628] px-7 py-[14px] text-[10px] font-medium uppercase tracking-[0.22em] text-[#FAFBFD] no-underline transition-transform duration-300 hover:-translate-y-0.5 sm:px-[34px] sm:py-4 sm:tracking-[0.28em]"
          >
            <span>Get In Touch</span>
          </a>
        </div>

        <div className="rounded-[28px] border border-[rgba(10,22,40,0.10)] bg-white/80 p-6 shadow-[0_24px_60px_rgba(10,22,40,0.06)] backdrop-blur-[8px] sm:p-8 lg:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0A1628]">House of Diams</p>
          <div className="mt-5 space-y-4 text-[#253246]">
            <p className="text-[15px] font-light leading-[1.9]">
              We build jewellery with the discipline of manufacturers and the eye of designers, bringing together natural
              diamonds, precision craftsmanship, and a modern luxury point of view.
            </p>
            <p className="text-[13px] font-light leading-[1.9] text-[#6A6A6A]">
              From fine jewellery to bespoke statements and hip hop pieces, every collection is shaped to feel personal,
              wearable, and unmistakably refined.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
