import type { RouteMetadata } from '../types/navigation';

/**
 * 全站页面元数据的唯一来源。这里不导入页面组件，因而布局、搜索与导航可以安全复用。
 */
export const routeMetadata: RouteMetadata[] = [
  {
    path: '/',
    label: 'Home',
    title: '首页',
    description: '项目总览与核心入口。',
    group: 'Overview',
  },
  {
    path: '/description',
    label: 'Projects',
    title: '项目描述',
    description: '项目背景、问题、方案与影响。',
    group: 'Project',
  },
  {
    path: '/notebook',
    label: 'Lab',
    title: '实验记录',
    description: '项目进度与实验时间线。',
    group: 'Lab',
  },
  {
    path: '/contribution',
    label: 'Human Practices',
    title: '奖项与贡献',
    description: '社区贡献和奖项证据。',
    group: 'Project',
  },
  {
    path: '/Education',
    label: 'Education',
    title: 'Education',
    description: '让更多人理解、参与和讨论合成生物学。',
    group: 'Human Practices',
    showInNavigation: false,
  },
  {
    path: '/human-practices',
    label: 'Integrated HP',
    title: 'Integrated Human Practices',
    description: 'Stakeholder feedback and its integration into project decisions.',
    group: 'Human Practices',
    showInNavigation: false,
  },
  {
    path: '/entrepreneurship',
    label: 'Entrepreneurship',
    title: 'Entrepreneurship',
    description: 'Sybio-Gutweaver business plan and commercialization pathway.',
    group: 'Human Practices',
    showInNavigation: false,
  },
  {
    path: '/team',
    label: 'Team',
    title: '团队介绍',
    description: '成员、分工与协作者。',
    group: 'Team',
  },
  {
    path: '/search',
    label: '搜索',
    title: '站内搜索',
    description: '按页面标题与简介搜索。',
    group: 'Utility',
    showInNavigation: false,
  },
  {
    path: '/contact',
    label: '联系',
    title: '联系表单',
    description: '联系表单验证示例。',
    group: 'Utility',
    showInNavigation: false,
  },
];
