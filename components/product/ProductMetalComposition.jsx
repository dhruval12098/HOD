'use client';

export default function ProductMetalComposition({ composition, fallbackColor = '#D4AF37' }) {
  if (!composition) return null;

  const parts = (composition.parts ?? []).filter((part) => Number(part.percentage) > 0);
  const total = parts.reduce((sum, part) => sum + Number(part.percentage || 0), 0);
  const chartParts = total > 0 ? parts : [];
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <section className="mb-10 mt-8">
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <div className="h-full rounded-[20px] bg-white p-5 shadow-[0_14px_32px_rgba(10,22,40,0.05)]">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8B94A5]">Metal</div>
          <div className="flex items-center gap-4">
            <div className="relative flex h-[112px] w-[112px] items-center justify-center rounded-full border border-[rgba(10,22,40,0.08)] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.95),rgba(235,240,247,0.9)_45%,rgba(220,228,238,0.85)_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_16px_28px_rgba(10,22,40,0.08)]">
              <svg viewBox="0 0 112 112" className="h-[92px] w-[92px] -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  fill="none"
                  stroke="rgba(10,22,40,0.08)"
                  strokeWidth="16"
                />
                {chartParts.length > 0
                  ? chartParts.map((part, index) => {
                      const value = Number(part.percentage || 0);
                      const segment = (value / total) * circumference;
                      const offset = circumference - accumulated;
                      accumulated += segment;
                      return (
                        <circle
                          key={`${part.partName}-${index}`}
                          cx="56"
                          cy="56"
                          r={radius}
                          fill="none"
                          stroke={part.colorHex || fallbackColor}
                          strokeWidth="16"
                          strokeLinecap="butt"
                          strokeDasharray={`${segment} ${circumference - segment}`}
                          strokeDashoffset={offset}
                        />
                      );
                    })
                  : null}
              </svg>
              <span className="absolute inset-[26px] rounded-full bg-white shadow-[inset_0_3px_8px_rgba(10,22,40,0.06)]" />
              <span
                className="absolute inset-[40px] rounded-full shadow-[inset_0_6px_10px_rgba(255,255,255,0.45)]"
                style={{ backgroundColor: fallbackColor }}
              />
            </div>
            <div>
              <div className="text-[30px] font-semibold leading-[1.1] text-[#0A1628]">{composition.name}</div>
              {composition.description ? <p className="mt-3 max-w-[36ch] text-[13px] leading-[1.8] text-[#6A6A6A]">{composition.description}</p> : null}
            </div>
          </div>
        </div>

        <div className="h-full rounded-[20px] bg-white p-5 shadow-[0_14px_32px_rgba(10,22,40,0.05)]">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8B94A5]">Composition</div>
          <div className="space-y-3">
            {(composition.parts ?? []).map((part, index) => (
              <div key={`${part.partName}-${index}`} className="flex items-center justify-between gap-4 rounded-[16px] border border-[rgba(10,22,40,0.08)] bg-[#FBFCFE] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-5 w-5 rounded-full border border-black/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]"
                    style={{ backgroundColor: part.colorHex || fallbackColor }}
                  />
                  <div className="text-[15px] font-medium text-[#0A1628]">{part.partName}</div>
                </div>
                <div className="text-[15px] font-semibold text-[#0A1628]">{part.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
