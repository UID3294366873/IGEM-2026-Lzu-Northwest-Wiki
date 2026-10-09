import { Link, useLocation } from 'react-router-dom';
import { routeMetadata } from '../../data/navigation';

/** 在路由切换前立即清除当前文档的滚动位置。 */
function resetScrollPosition() {
  const previousBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = previousBehavior;
  });
}

/**
 * 根据当前路由自动生成上一页和下一页链接。
 * @returns 页面顺序导航；当前路由不在注册表时返回 null。
 */
export function PageNavigation() {
  const location = useLocation();
  const index = routeMetadata.findIndex((route) => route.path === location.pathname);
  if (index < 0) return null;
  const previous = routeMetadata[index - 1];
  const next = routeMetadata[index + 1];
  return (
    <nav className="page-navigation" aria-label="页面导航">
      <div className="page-navigation__previous">
        {previous ? (
          <Link to={previous.path} onClick={resetScrollPosition}>
            <span>← 上一页</span>
            <strong>{previous.title}</strong>
          </Link>
        ) : (
          <span />
        )}
      </div>
      <div className="page-navigation__next">
        {next ? (
          <Link to={next.path} onClick={resetScrollPosition}>
            <span>下一页 →</span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}
