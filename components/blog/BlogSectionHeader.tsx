interface BlogSectionHeaderProps {
  onViewAll?: () => void;
  title?: string;
}

export default function BlogSectionHeader({ onViewAll, title = 'Blogs' }: BlogSectionHeaderProps) {
  return (
    <div className="mb-11 flex items-baseline justify-between gap-6">
      <div>
        <h2 className="font-display-title font-light uppercase leading-[1.08] tracking-[0.01em] text-[var(--theme-heading)] max-md:text-[28px]" style={{ fontSize: 'clamp(24px, 4.5vw, 54px)', fontWeight: 400 }}>
          {title}
        </h2>
      </div>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onViewAll?.();
        }}
        className="self-end border-b border-b-[var(--theme-border-strong)] pb-0.5 text-[8px] uppercase tracking-[0.22em] text-[var(--theme-ink)] no-underline transition-[gap] duration-300 hover:gap-3.5"
      >
        {'View All Stories ->'}
      </a>
    </div>
  );
}
