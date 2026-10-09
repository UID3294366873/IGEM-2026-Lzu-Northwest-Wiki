import type { RouteMetadata } from '../types/navigation';

/** 页面元数据；数组顺序同时决定页面底部的上一页与下一页关系。 */
export const routeMetadata: RouteMetadata[] = [
  {
    path: '/human-practices',
    label: 'Integrated HP',
    title: 'Integrated Human Practices',
    description: 'Stakeholder feedback and its integration into project decisions.',
    group: 'Human Practices',
  },
  {
    path: '/Education',
    label: 'Education',
    title: 'Education',
    description: '让更多人理解、参与和讨论合成生物学。',
    group: 'Human Practices',
  },
  {
    path: '/entrepreneurship',
    label: 'Entrepreneurship',
    title: 'Entrepreneurship',
    description: 'Sybio-Gutweaver business plan and commercialization pathway.',
    group: 'Human Practices',
  },
  {
    path: '/team',
    label: 'Members',
    title: '团队介绍',
    description: '成员、分工与协作者。',
    group: 'Team',
  },
];
