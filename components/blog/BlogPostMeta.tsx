interface BlogPostMetaProps {
  date: string;
  author: string;
  readTime: string;
}

export default function BlogPostMeta({ date, author, readTime }: BlogPostMetaProps) {
  const items = [
    { label: "Reading time", value: readTime, alignment: "sm:text-left" },
    { label: "Published", value: date, alignment: "sm:text-center" },
    { label: "Written by", value: author, alignment: "sm:text-right" },
  ];

  if (!items.some((item) => item.value)) return null;

  return (
    <dl className="mb-8 grid grid-cols-1 gap-4 border-b border-[rgba(10,22,40,0.12)] pb-6 font-[var(--font-manrope)] sm:grid-cols-3 sm:gap-6">
      {items.map((item) => (
        <div
          key={item.label}
          className={`${item.alignment} ${item.value ? "" : "hidden sm:invisible sm:block"}`}
        >
          <dt className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#765F35]">{item.label}</dt>
          <dd className="mt-1 text-[14px] font-semibold leading-5 text-[#344154]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
