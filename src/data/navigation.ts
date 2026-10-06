import type { RouteMetadata } from '../types/navigation';

/** 下拉菜单页面的元数据，也是页面顺序导航的唯一来源。 */
export const routeMetadata: RouteMetadata[] = [
  {
    path: '/Education',
    label: 'Education',
    title: 'Education',
    description: '让更多人理解、参与和讨论合成生物学。',
    group: 'Human Practices',
  },
  {
    path: '/human-practices',
    label: 'Integrated HP',
    title: 'Integrated Human Practices',
    description: 'Stakeholder feedback and its integration into project decisions.',
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
