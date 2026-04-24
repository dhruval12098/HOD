type DocsPageProps = {
  eyebrow: string
  title: string
  subtitle: string
  blocks: Array<{
    heading: string
    description: string
    body: string
  }>
}

export default function DocsPage({ eyebrow, title, subtitle, blocks }: DocsPageProps) {
  return (
    <main className="min-h-screen bg-(--bg) text-(--ink)">
      <section className="border-b border-black/5 bg-white/70">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-7 lg:px-[52px]">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#0A1628]">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-[var(--font-cormorant)] text-5xl leading-none text-[#181512] sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-[#5E5648] sm:text-base">{subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-7 lg:px-[52px]">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-[#D9E2EE] bg-white p-8 shadow-[0_20px_80px_rgba(10,22,40,0.08)]">
            <div className="space-y-8">
              {blocks.map((block, index) => (
                <section key={`${block.heading}-${index}`} className="space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#0A1628]">Section {index + 1}</p>
                    <h3 className="mt-2 font-[var(--font-cormorant)] text-3xl leading-none text-[#181512]">{block.heading}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5E5648]">{block.description}</p>
                  </div>
                  {block.body ? (
                    <div
                      className="docs-body text-sm leading-8 text-[#3E362A] sm:text-[15px]"
                      dangerouslySetInnerHTML={{ __html: block.body }}
                    />
                  ) : null}
                </section>
              ))}
            </div>
          </div>

          <aside className="rounded-[28px] border border-[#D9E2EE] bg-[#0A1628] p-8 text-[#FFFFFF] shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#0A1628]">House of Diams</p>
            <h2 className="mt-4 font-[var(--font-cormorant)] text-3xl leading-none text-white">Need help?</h2>
            <p className="mt-4 text-sm leading-7 text-[#C8BFA7]">
              Reach out if you need clarification on shipping, returns, privacy, or order terms.
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <p>info@houseofdiams.com</p>
              <p>+91 93285 36178</p>
              <p>Surat, Gujarat, India</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
