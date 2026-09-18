import type { PropsWithChildren } from 'react';

/** 标签组件属性。 */
interface BadgeProps extends PropsWithChildren {
  tone?: 'neutral' | 'success' | 'warning';
}

/**
 * 展示短状态或分类文字，不使用颜色作为唯一信息载体。
 * @param props 标签语气和文字。
 * @returns BEM 标签元素。
 */
export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
