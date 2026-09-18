import type { ReactNode } from 'react';

/** 章节标题属性。 */
interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * 统一章节编号、标题、说明和可选操作区域。
 * @param props 眉题、标题、说明及操作元素。
 * @returns 标准章节头部。
 */
export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <div className="section-heading__copy">
        {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
        <h2 className="section-heading__title">{title}</h2>
        {description ? <p className="section-heading__description">{description}</p> : null}
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </header>
  );
}
