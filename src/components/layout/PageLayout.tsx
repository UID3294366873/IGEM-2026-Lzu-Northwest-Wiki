import type { PropsWithChildren } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { PageSection } from '../../types/navigation';
import { Badge } from '../common/Badge';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { PageNavigation } from '../navigation/PageNavigation';
import { TableOfContents } from '../navigation/TableOfContents';
import { Container } from './Container';

/** 页面布局属性。 */
interface PageLayoutProps extends PropsWithChildren {
  title: string;
  lead: string;
  group?: string;
  sections?: PageSection[];
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
  children,
}: PageLayoutProps) {
  useDocumentTitle(title);
  return (
    <Container as="main" className="page">
      <div id="main-content" tabIndex={-1}>
        <Breadcrumbs group={group} current={title} isHome={title === '首页'} />
        <header className="page__header">
          <div className="page__kicker">
            <Badge>{group}</Badge>
            <span>2026 / TEAM WIKI</span>
          </div>
          <h1 className="page__title">{title}</h1>
          <p className="page__lead">{lead}</p>
          <div className="page__meta">
            <span>STATUS: DRAFT</span>
            <span>UPDATED: 2026-09-08</span>
          </div>
        </header>
        <div className="page__layout">
          <div className="page__content">{children}</div>
          {sections.length > 0 ? (
            <aside className="page__aside">
              <TableOfContents sections={sections} />
            </aside>
          ) : null}
        </div>
        <PageNavigation />
      </div>
    </Container>
  );
}
