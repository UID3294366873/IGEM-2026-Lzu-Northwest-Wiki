import { useMemo } from 'react';
import { useActiveSection } from '../../hooks/useActiveSection';

/** Word 目录中的单个条目。 */
export interface EntrepreneurshipTocItem {
  number: string;
  level: number;
  label: string;
  targetId: string;
}

interface TocNode extends EntrepreneurshipTocItem {
  children: TocNode[];
}

interface EntrepreneurshipTableOfContentsProps {
  items: EntrepreneurshipTocItem[];
  headingIds: string[];
}

/**
 * 将 Word 的扁平目录层级转换为树形结构。
 * @param items 按文档顺序排列的目录条目。
 * @returns 可递归渲染的目录节点。
 */
function buildTocTree(items: EntrepreneurshipTocItem[]): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];
  items.forEach((item) => {
    const node = { ...item, children: [] };
    while (stack.length >= item.level) stack.pop();
    const parent = stack[stack.length - 1];
    if (parent) parent.children.push(node);
    else roots.push(node);
    stack.push(node);
  });
  return roots;
}

/**
 * 检查当前阅读标题是否位于给定目录分支中。
 * @param node 当前目录节点。
 * @param activeId 当前正文标题 id。
 * @param activeNumber 当前正文标题编号。
 * @returns 当前节点或后代处于阅读位置时返回 true。
 */
function isActiveBranch(node: TocNode, activeId: string, activeNumber: string): boolean {
  if (
    node.targetId === activeId ||
    node.children.some((child) => isActiveBranch(child, activeId, activeNumber))
  ) {
    return true;
  }
  return node.level === 1 && activeNumber.split('.')[0] === node.number;
}

/**
 * 渲染可随滚动自动展开单一分支的多级侧边目录。
 * @param props Word 目录条目与正文标题 id。
 * @returns Entrepreneurship 页侧边目录。
 */
export function EntrepreneurshipTableOfContents({
  items,
  headingIds,
}: EntrepreneurshipTableOfContentsProps) {
  const activeId = useActiveSection(headingIds);
  const activeNumber = activeId.replace(/^section-/, '').replaceAll('-', '.');
  const tree = useMemo(() => buildTocTree(items), [items]);

  const renderNodes = (nodes: TocNode[], depth = 1, visible = true) => (
    <ol className={`entrepreneurship-toc__list entrepreneurship-toc__list--level-${depth}`}>
      {nodes.map((node) => {
        const branchActive = isActiveBranch(node, activeId, activeNumber);
        const expanded = branchActive && node.children.length > 0;
        return (
          <li className="entrepreneurship-toc__item" key={`${node.number}-${node.targetId}`}>
            <a
              className={`entrepreneurship-toc__link${node.targetId === activeId ? ' entrepreneurship-toc__link--active' : ''}`}
              href={`#${node.targetId}`}
              aria-current={node.targetId === activeId ? 'location' : undefined}
              aria-expanded={node.children.length > 0 ? expanded : undefined}
              tabIndex={visible ? undefined : -1}
            >
              {node.label}
            </a>
            {node.children.length > 0 ? (
              <div
                className={`entrepreneurship-toc__branch${expanded ? ' entrepreneurship-toc__branch--expanded' : ''}`}
                aria-hidden={!expanded}
              >
                <div className="entrepreneurship-toc__branch-inner">
                  {renderNodes(node.children, depth + 1, visible && expanded)}
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );

  return (
    <nav className="entrepreneurship-toc" aria-label="Entrepreneurship table of contents">
      <p className="entrepreneurship-toc__title">Contents</p>
      {renderNodes(tree)}
    </nav>
  );
}
