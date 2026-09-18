import type { ElementType, PropsWithChildren } from 'react';

/** 容器组件属性。 */
interface ContainerProps extends PropsWithChildren {
  as?: ElementType;
  className?: string;
}

/**
 * 提供可替换语义标签的通用内容容器，不承载业务逻辑。
 * @param props 标签类型、附加类名及子元素。
 * @returns 带 BEM 基础类名的容器。
 */
export function Container({ as: Tag = 'div', className = '', children }: ContainerProps) {
  return <Tag className={`layout-container ${className}`.trim()}>{children}</Tag>;
}
