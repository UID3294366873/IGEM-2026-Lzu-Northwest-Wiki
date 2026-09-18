import { Link } from 'react-router-dom';

/** 面包屑属性。 */
interface BreadcrumbsProps {
  group: string;
  current: string;
  isHome?: boolean;
}

/**
 * 展示当前页面在 Wiki 信息架构中的位置。
 * @param props 页面分组、当前标题及是否首页。
 * @returns 带 aria-label 的面包屑导航。
 */
export function Breadcrumbs({ group, current, isHome = false }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="面包屑">
      <ol className="breadcrumbs__list">
        <li className="breadcrumbs__item">
          {isHome ? <span aria-current="page">首页</span> : <Link to="/">首页</Link>}
        </li>
        {!isHome ? (
          <li className="breadcrumbs__item">
            <span>{group}</span>
          </li>
        ) : null}
        {!isHome ? (
          <li className="breadcrumbs__item">
            <span aria-current="page">{current}</span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
