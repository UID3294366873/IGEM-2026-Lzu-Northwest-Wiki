/** 引用块属性。 */
interface QuoteBlockProps {
  quote: string;
  author: string;
  context: string;
}

/**
 * 展示利益相关方或团队反思引用，并保留来源上下文。
 * @param props 引文、署名及背景。
 * @returns 语义化引用块。
 */
export function QuoteBlock({ quote, author, context }: QuoteBlockProps) {
  return (
    <figure className="quote-block">
      <blockquote>“{quote}”</blockquote>
      <figcaption>
        — {author}，{context}
      </figcaption>
    </figure>
  );
}
