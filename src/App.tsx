import { Suspense, useLayoutEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { BackToTop } from './components/common/BackToTop';
import { SiteFooter } from './components/layout/SiteFooter';
import { SiteHeader } from './components/layout/SiteHeader';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { routeDefinitions } from './routes/routeDefinitions';

/** 每次切换页面时重置滚动位置，避免上下页导航继承上一页的底部位置。 */
function ScrollToPageTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const frame = window.requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousBehavior;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}

/**
 * 组合全局布局与路由，不在此保存页面业务逻辑。
 * @returns 应用根组件。
 */
export default function App() {
  return (
    <div className="app-shell">
      <ScrollToPageTop />
      <SiteHeader />
      <Suspense fallback={<main className="async-state">正在加载页面…</main>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
