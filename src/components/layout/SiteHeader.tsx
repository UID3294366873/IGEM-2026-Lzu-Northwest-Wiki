import { NavLink, useLocation } from 'react-router-dom';
import { routeMetadata } from '../../data/navigation';
import { useDisclosure } from '../../hooks/useDisclosure';

/**
 * 渲染全站语义化导航，NavLink 自动处理当前页面高亮与 aria-current。
 * @returns 网站页眉。
 */
export function SiteHeader() {
  const teamName = import.meta.env.VITE_TEAM_NAME || 'LZU-Northwest';
  const menu = useDisclosure();
  const location = useLocation();
  return (
    <header className="site-header">
      <a className="site-header__skip-link" href="#main-content">
        跳到主要内容
      </a>
      <div className="site-header__inner">
        <p className="site-header__brand">
          <NavLink to="/">
            <span className="site-header__mark" aria-hidden="true" />
            <span>{teamName}</span>
          </NavLink>
        </p>
        <button
          className="site-header__toggle"
          type="button"
          aria-expanded={menu.isOpen}
          aria-controls="primary-navigation"
          onClick={menu.toggle}
        >
          {menu.isOpen ? '关闭菜单 ×' : '打开菜单 ≡'}
        </button>
        <nav
          id="primary-navigation"
          className={`site-header__navigation${menu.isOpen ? ' site-header__navigation--open' : ''}`}
          aria-label="主导航"
        >
          <ul className="site-header__list">
            {routeMetadata
              .filter((route) => route.showInNavigation !== false)
              .map((route) => {
                const isEngagement = route.path === '/contribution';
                const isEngagementActive =
                  location.pathname === '/contribution' ||
                  location.pathname === '/entrepreneurship';
                return (
                  <li
                    className={`site-header__item${isEngagement ? ' site-header__item--dropdown' : ''}`}
                    key={route.path}
                  >
                    <NavLink
                      className={({ isActive }) =>
                        `site-header__link${isActive || (isEngagement && isEngagementActive) ? ' site-header__link--active' : ''}`
                      }
                      end={route.path === '/'}
                      to={route.path}
                      onClick={menu.close}
                      aria-haspopup={isEngagement ? 'true' : undefined}
                    >
                      {route.label}
                    </NavLink>
                    {isEngagement ? (
                      <ul className="site-header__submenu" aria-label="Engagement submenu">
                        <li>
                          <NavLink
                            className={({ isActive }) =>
                              `site-header__submenu-link${isActive ? ' site-header__submenu-link--active' : ''}`
                            }
                            to="/entrepreneurship"
                            onClick={menu.close}
                          >
                            Entrepreneurship
                          </NavLink>
                        </li>
                      </ul>
                    ) : null}
                  </li>
                );
              })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
