interface BlogPostTagsProps {
  tags: string[];
}

export default function BlogPostTags({ tags }: BlogPostTagsProps) {
  return (
    <div className="flex gap-2 flex-wrap mt-[52px] pt-7 border-t border-[rgba(10,22,40,0.09)]">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[7.5px] tracking-[0.18em] uppercase px-3.5 py-1.5 border border-[rgba(10,22,40,0.18)] text-[#6A6A6A] cursor-pointer transition-[border-color,color] duration-200 hover:border-[#0A1628] hover:text-[#0A1628]"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
