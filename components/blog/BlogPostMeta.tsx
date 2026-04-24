interface BlogPostMetaProps {
  date: string;
  author: string;
  readTime: string;
}

export default function BlogPostMeta({ date, author, readTime }: BlogPostMetaProps) {
  return (
    <div className="flex items-center gap-5 mb-7 pb-5 border-b border-[rgba(10,22,40,0.09)]">
      <span className="text-[7.5px] tracking-[0.2em] uppercase text-[#9A9A9A]">
        {date}
      </span>
      <span className="w-[3px] h-[3px] rounded-full bg-[rgba(10,22,40,0.18)]" />
      <span className="text-[7.5px] tracking-[0.16em] uppercase text-[#6A6A6A]">
        {author}
      </span>
      <span className="text-[7.5px] tracking-[0.16em] uppercase text-[#9A9A9A] ml-auto">
        {readTime}
      </span>
    </div>
  );
}
