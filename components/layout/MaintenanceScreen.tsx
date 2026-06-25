type MaintenanceScreenProps = {
  message: string
}

export default function MaintenanceScreen({ message }: MaintenanceScreenProps) {
  return (
    <main className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFBFD] px-5 py-16 text-[#0A1628]">
      <div className="pointer-events-none absolute -left-28 top-1/4 h-80 w-80 rounded-full bg-[#0A1628]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-1/4 h-80 w-80 rounded-full bg-[#20304A]/10 blur-3xl" />

      <section className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="mb-10 h-px w-16 bg-[#0A1628]" />
        <h1
          className="text-[#0A1628]"
          style={{
            fontFamily: 'var(--font-house-of-diams-wordmark)',
            fontSize: 'clamp(42px, 7vw, 96px)',
            lineHeight: 1.22,
            fontWeight: 400,
            letterSpacing: '0.04em',
          }}
        >
          We&apos;ll Be Back Shortly
        </h1>
        <p className="mt-12 max-w-2xl text-[13px] font-light leading-8 tracking-[0.12em] text-[#4F5A6A]">
          {message}
        </p>
      </section>
    </main>
  )
}
