import type { PropsWithChildren } from 'react';

/** 提示框属性。 */
interface CalloutProps extends PropsWithChildren {
  title: string;
  tone?: 'info' | 'warning' | 'success';
}

/**
 * 呈现需要读者特别留意的信息。
 * @param props 标题、语气和正文内容。
 * @returns 带语义标题的提示框。
 */
export function Callout({ title, tone = 'info', children }: CalloutProps) {
  return (
    <aside className={`callout callout--${tone}`}>
      <strong className="callout__title">{title}</strong>
      <div className="callout__body">{children}</div>
    </aside>
  );
}
