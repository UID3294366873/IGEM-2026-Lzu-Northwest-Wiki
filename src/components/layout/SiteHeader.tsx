import { NavLink, useLocation } from 'react-router-dom';
import { useDisclosure } from '../../hooks/useDisclosure';

interface NavigationGroup {
  label: string;
  items?: Array<{ label: string; path: string }>;
}

const navigationGroups: NavigationGroup[] = [
  { label: 'Home' },
  { label: 'Projects' },
  { label: 'Lab' },
  {
    label: 'Human Practices',
    items: [
      { label: 'Integrated HP', path: '/human-practices' },
      { label: 'Education', path: '/Education' },
      { label: 'Entrepreneurship', path: '/entrepreneurship' },
    ],
  },
  { label: 'Team', items: [{ label: 'Members', path: '/team' }] },
];

/**
 * 渲染全站导航。顶层栏目仅作为下拉菜单标签，只有下拉菜单项提供页面路由。
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
              src={`${import.meta.env.BASE_URL}shared/images/branding/lzu-northwest-logo.png`}
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
            {navigationGroups.map((group) => {
              const hasSubmenu = Boolean(group.items?.length);
              const isActive =
                group.items?.some((item) => item.path === location.pathname) ?? false;

              return (
                <li
                  className={`site-header__item${hasSubmenu ? ' site-header__item--dropdown' : ''}`}
                  key={group.label}
                >
                  <span
                    className={`site-header__link${isActive ? ' site-header__link--active' : ''}`}
                    aria-haspopup={hasSubmenu ? 'true' : undefined}
                    tabIndex={hasSubmenu ? 0 : undefined}
                  >
                    {group.label}
                  </span>
                  {hasSubmenu ? (
                    <ul className="site-header__submenu" aria-label={`${group.label} submenu`}>
                      {group.items?.map((item) => (
                        <li key={item.path}>
                          <NavLink
                            className={({ isActive: isItemActive }) =>
                              `site-header__submenu-link${isItemActive ? ' site-header__submenu-link--active' : ''}`
                            }
                            to={item.path}
                            onClick={(event) => {
                              event.currentTarget.blur();
                              menu.close();
                            }}
                          >
                            {item.label}
                          </NavLink>
                        </li>
                      ))}
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
