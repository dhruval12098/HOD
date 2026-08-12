interface BlogPostMetaProps {
  date: string;
  author: string;
  readTime: string;
}

export default function BlogPostMeta({ date, author, readTime }: BlogPostMetaProps) {
  const items = [
    date ? { label: "Published", value: date } : null,
    author ? { label: "Written by", value: author } : null,
    readTime ? { label: "Reading time", value: readTime } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  if (!items.length) return null;

  return (
    <dl className="mb-8 flex flex-wrap gap-x-8 gap-y-4 border-b border-[rgba(10,22,40,0.12)] pb-6 font-[var(--font-manrope)]">
      {items.map((item) => (
        <div key={item.label} className="min-w-[120px]">
          <dt className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#765F35]">{item.label}</dt>
          <dd className="mt-1 text-[14px] font-semibold leading-5 text-[#344154]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
