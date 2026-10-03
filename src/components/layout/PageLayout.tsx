import type { PropsWithChildren, ReactNode } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { PageSection } from '../../types/navigation';
import { PageNavigation } from '../navigation/PageNavigation';
import { TableOfContents } from '../navigation/TableOfContents';
import { Container } from './Container';

/** 页面布局属性。 */
interface PageLayoutProps extends PropsWithChildren {
  title: string;
  lead: string;
  group?: string;
  sections?: PageSection[];
  /** 仅作用于当前页面的类名，用于在不改动共享模板的情况下覆写布局。 */
  pageClassName?: string;
  /** 当前页面可选的头图内容；未传入时使用通用低保真占位框。 */
  heroMedia?: ReactNode;
  /** 可选的自定义侧边栏；用于需要层级目录等特殊导航的长页面。 */
  sidebar?: ReactNode;
}

/**
 * 统一页面标题、简介与主要内容入口，确保新增页面具有一致可访问结构。
 * @param props 页面标题、简介与内容。
 * @returns 标准页面布局。
 */
export function PageLayout({
  title,
  lead,
  group = 'Wiki',
  sections = [],
  pageClassName = '',
  heroMedia,
  sidebar,
  children,
}: PageLayoutProps) {
  useDocumentTitle(title);
  const hasSidebar = sections.length > 0 || Boolean(sidebar);
  return (
    <Container as="main" className={`page project-page ${pageClassName}`.trim()}>
      <div id="main-content" tabIndex={-1}>
        <header className="project-hero">
          <div className="project-hero__copy">
            <p className="project-hero__eyebrow">{group} / 2026 Wiki</p>
            <h1>{title}</h1>
            <p>{lead}</p>
          </div>
          {heroMedia ?? (
            <div
              className="project-hero__media"
              role="img"
              aria-label={`${title} 主视觉预留区域`}
            />
          )}
        </header>
        <div className={`project-page__body${hasSidebar ? '' : ' project-page__body--single'}`}>
          {hasSidebar ? (
            <aside className="project-page__aside">
              {sidebar ?? <TableOfContents sections={sections} />}
            </aside>
          ) : null}
          <article className="project-page__article">
            {children}
            <PageNavigation />
          </article>
        </div>
      </div>
    </Container>
  );
}
