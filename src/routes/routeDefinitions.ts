import { lazy } from 'react';
import { ContactPage } from '../pages/ContactPage';
import { ContributionPage } from '../pages/ContributionPage';
import { DescriptionPage } from '../pages/DescriptionPage';
import { HomePage } from '../pages/HomePage';
import { NotebookPage } from '../pages/NotebookPage';
import { SearchPage } from '../pages/SearchPage';
import { TeamPage } from '../pages/TeamPage';
import { routeMetadata } from '../data/navigation';
import type { RouteDefinition } from '../types/navigation';

const EntrepreneurshipPage = lazy(() =>
  import('../pages/EntrepreneurshipPage').then((module) => ({
    default: module.EntrepreneurshipPage,
  })),
);

const EducationPage = lazy(() =>
  import('../pages/EducationPage').then((module) => ({ default: module.EducationPage })),
);

const IntegratedHpPage = lazy(() =>
  import('../pages/IntegratedHpPage').then((module) => ({ default: module.IntegratedHpPage })),
);

/**
 * 组件路径映射。页面文案统一维护在 navigation 数据中，避免产生循环依赖。
 */
const componentByPath = {
  '/': HomePage,
  '/description': DescriptionPage,
  '/team': TeamPage,
  '/notebook': NotebookPage,
  '/contribution': ContributionPage,
  '/entrepreneurship': EntrepreneurshipPage,
  '/Education': EducationPage,
  '/human-practices': IntegratedHpPage,
  '/search': SearchPage,
  '/contact': ContactPage,
} as const;

/**
 * 为每条页面元数据装配组件。
 * @returns 可交给 React Router 的完整定义。
 */
function createRouteDefinitions(): RouteDefinition[] {
  return routeMetadata.map((route) => ({
    ...route,
    component: componentByPath[route.path as keyof typeof componentByPath],
  }));
}

export const routeDefinitions = createRouteDefinitions();
