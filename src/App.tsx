import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { BackToTop } from './components/common/BackToTop';
import { SiteFooter } from './components/layout/SiteFooter';
import { SiteHeader } from './components/layout/SiteHeader';
import { NotFoundPage } from './pages/NotFoundPage';
import { routeDefinitions } from './routes/routeDefinitions';

/**
 * 组合全局布局与路由，不在此保存页面业务逻辑。
 * @returns 应用根组件。
 */
export default function App() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <Suspense fallback={<main className="async-state">正在加载页面…</main>}>
        <Routes>
          {routeDefinitions.map(({ path, component: Page }) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}
