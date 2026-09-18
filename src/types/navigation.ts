import type { ComponentType } from 'react';

/** 单条页面元数据，作为导航、搜索与上下页关系的唯一数据源。 */
export interface RouteMetadata {
  path: string;
  label: string;
  title: string;
  description: string;
  group: string;
  showInNavigation?: boolean;
}

/** 将页面元数据与实际 React 页面组件组合后的路由定义。 */
export interface RouteDefinition extends RouteMetadata {
  component: ComponentType;
}

/** 页面内章节锚点定义。 */
export interface PageSection {
  id: string;
  label: string;
}
