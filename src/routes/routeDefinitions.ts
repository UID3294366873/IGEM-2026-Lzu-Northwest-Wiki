import { lazy } from 'react';
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

/** 仅装配下拉菜单中实际存在的页面。 */
const componentByPath = {
  '/Education': EducationPage,
  '/human-practices': IntegratedHpPage,
  '/entrepreneurship': EntrepreneurshipPage,
  '/team': TeamPage,
} as const;

export const routeDefinitions: RouteDefinition[] = routeMetadata.map((route) => ({
  ...route,
  component: componentByPath[route.path as keyof typeof componentByPath],
}));
