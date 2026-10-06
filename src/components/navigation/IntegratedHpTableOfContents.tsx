import { useMemo } from 'react';
import { useActiveSection } from '../../hooks/useActiveSection';

export interface IntegratedHpTocItem {
  text: string;
  level: number;
  id: string;
  children?: IntegratedHpTocItem[];
}

interface IntegratedHpTableOfContentsProps {
  items: IntegratedHpTocItem[];
  headingIds: string[];
}

/**
 * 判断目录节点本身或后代是否处于当前阅读位置。
 * @param item 目录节点。
 * @param activeId 当前标题 id。
 * @returns 当前分支应展开时为 true。
 */
function containsActiveItem(item: IntegratedHpTocItem, activeId: string): boolean {
  return (
    item.id === activeId ||
    Boolean(item.children?.some((child) => containsActiveItem(child, activeId)))
  );
}

/**
 * 渲染 Integrated HP 的三级 Word 标题目录，默认仅展示一级阶段。
 * @param props 目录树和正文标题 id。
 * @returns 随滚动展开当前分支的目录。
 */
export function IntegratedHpTableOfContents({
  items,
  headingIds,
}: IntegratedHpTableOfContentsProps) {
  const activeId = useActiveSection(headingIds);
  const activeRootId = useMemo(
    () => items.find((item) => containsActiveItem(item, activeId))?.id,
    [activeId, items],
  );

  const renderItems = (nodes: IntegratedHpTocItem[], depth: number, ancestorsVisible: boolean) => (
    <ol className={depth === 1 ? 'education-toc__list' : 'education-toc__sublist'}>
      {nodes.map((item) => {
        const inActiveBranch = containsActiveItem(item, activeId);
        const expanded = item.children?.length ? inActiveBranch : false;
        const visible = ancestorsVisible && (depth === 1 || inActiveBranch);
        return (
          <li className="education-toc__item" key={item.id}>
            <a
              className={`education-toc__link${depth > 1 ? ' education-toc__link--child' : ''}${item.id === activeId ? ' education-toc__link--active' : ''}`}
              href={`#${item.id}`}
              aria-current={item.id === activeId ? 'location' : undefined}
              aria-expanded={item.children?.length ? expanded : undefined}
              tabIndex={depth === 1 || visible ? undefined : -1}
            >
              {item.text}
            </a>
            {item.children?.length ? (
              <div
                className={`education-toc__branch${expanded ? ' education-toc__branch--expanded' : ''}`}
                aria-hidden={!expanded}
              >
                <div className="education-toc__branch-inner">
                  {renderItems(item.children, depth + 1, visible && expanded)}
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );

  return (
    <nav className="education-toc" aria-label="Integrated Human Practices table of contents">
      <p className="education-toc__title">Contents</p>
      <div data-active-root={activeRootId}>{renderItems(items, 1, true)}</div>
    </nav>
  );
}
