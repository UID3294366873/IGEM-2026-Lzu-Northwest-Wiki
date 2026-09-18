import type { PropsWithChildren, ReactNode } from 'react';

/** 通用卡片属性。 */
interface CardProps extends PropsWithChildren {
  title: ReactNode;
  headingLevel?: 2 | 3 | 4;
}

/**
 * 展示带标题的独立内容块，标题层级由使用页面决定。
 * @param props 标题、标题层级和卡片内容。
 * @returns 语义化 article 卡片。
 */
export function Card({ title, headingLevel = 2, children }: CardProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article className="card">
      <Heading className="card__title">{title}</Heading>
      <div className="card__body">{children}</div>
    </article>
  );
}
