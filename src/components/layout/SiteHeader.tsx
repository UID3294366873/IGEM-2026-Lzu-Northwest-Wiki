import { NavLink } from 'react-router-dom';
import { routeMetadata } from '../../data/navigation';
import { useDisclosure } from '../../hooks/useDisclosure';

/**
 * 渲染全站语义化导航，NavLink 自动处理当前页面高亮与 aria-current。
 * @returns 网站页眉。
 */
export function SiteHeader() {
  const teamName = import.meta.env.VITE_TEAM_NAME || 'Example Team';
  const menu = useDisclosure();
  return (
    <header className="site-header">
      <a className="site-header__skip-link" href="#main-content">
        跳到主要内容
      </a>
      <div className="site-header__bar">
        <p className="site-header__brand">
          <NavLink to="/">
            <span aria-hidden="true">[ ◇ ]</span> {teamName}
          </NavLink>
        </p>
        <p className="site-header__edition">iGEM / 2026</p>
        <button
          className="site-header__toggle"
          type="button"
          aria-expanded={menu.isOpen}
          aria-controls="primary-navigation"
          onClick={menu.toggle}
        >
          {menu.isOpen ? '关闭菜单 ×' : '打开菜单 ≡'}
        </button>
      </div>
      <nav
        id="primary-navigation"
        className={`site-header__navigation${menu.isOpen ? ' site-header__navigation--open' : ''}`}
        aria-label="主导航"
      >
        <ul className="site-header__list">
          {routeMetadata
            .filter((route) => route.showInNavigation !== false)
            .map((route) => (
              <li className="site-header__item" key={route.path}>
                <NavLink
                  className={({ isActive }) =>
                    `site-header__link${isActive ? ' site-header__link--active' : ''}`
                  }
                  end={route.path === '/'}
                  to={route.path}
                  onClick={menu.close}
                >
                  {route.label}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>
    </header>
  );
}
