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
          <NavLink to="/" aria-label={`${teamName} 首页`}>
            <img
              className="site-header__mark"
              src={`${import.meta.env.BASE_URL}images/team/lzu-northwest-logo.png`}
              alt=""
            />
            <span className="site-header__wordmark" aria-hidden="true">
              <span>LZU-</span>
              <span>Northwest</span>
            </span>
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
                const isHumanPractices = route.path === '/contribution';
                const isTeam = route.path === '/team';
                const hasSubmenu = isHumanPractices || isTeam;
                const isHumanPracticesActive =
                  location.pathname === '/contribution' ||
                  location.pathname === '/entrepreneurship' ||
                  location.pathname === '/Education' ||
                  location.pathname === '/human-practices';
                return (
                  <li
                    className={`site-header__item${hasSubmenu ? ' site-header__item--dropdown' : ''}`}
                    key={route.path}
                  >
                    <NavLink
                      className={({ isActive }) =>
                        `site-header__link${isActive || (isHumanPractices && isHumanPracticesActive) ? ' site-header__link--active' : ''}`
                      }
                      end={route.path === '/'}
                      to={route.path}
                      onClick={menu.close}
                      aria-haspopup={hasSubmenu ? 'true' : undefined}
                    >
                      {route.label}
                    </NavLink>
                    {isHumanPractices ? (
                      <ul className="site-header__submenu" aria-label="Human Practices submenu">
                        <li>
                          <NavLink
                            className={({ isActive }) =>
                              `site-header__submenu-link${isActive ? ' site-header__submenu-link--active' : ''}`
                            }
                            to="/Education"
                            onClick={menu.close}
                          >
                            Education
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            className={({ isActive }) =>
                              `site-header__submenu-link${isActive ? ' site-header__submenu-link--active' : ''}`
                            }
                            to="/human-practices"
                            onClick={menu.close}
                          >
                            Integrated HP
                          </NavLink>
                        </li>
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
                    {isTeam ? (
                      <ul className="site-header__submenu" aria-label="Team submenu">
                        <li>
                          <NavLink
                            className={({ isActive }) =>
                              `site-header__submenu-link${isActive ? ' site-header__submenu-link--active' : ''}`
                            }
                            to="/team"
                            onClick={menu.close}
                          >
                            Members
                          </NavLink>
                        </li>
                        <li>
                          <span
                            className="site-header__submenu-link site-header__submenu-link--disabled"
                            aria-disabled="true"
                          >
                            Attributions
                          </span>
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
