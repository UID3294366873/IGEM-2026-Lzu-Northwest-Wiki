import { useMemo } from 'react';
import { useActiveSection } from '../../hooks/useActiveSection';

export interface EducationTocItem {
  text: string;
  level: number;
  id: string;
  children?: EducationTocItem[];
}

interface EducationTableOfContentsProps {
  items: EducationTocItem[];
  headingIds: string[];
}

/**
 * 显示 Word 标题层级，并只展开当前一级章节的子目录。
 * @param props 目录树与正文标题 id。
 * @returns Education 页面目录。
 */
export function EducationTableOfContents({ items, headingIds }: EducationTableOfContentsProps) {
  const activeId = useActiveSection(headingIds);
  const activeRoot = useMemo(() => {
    return items.find(
      (item) => item.id === activeId || item.children?.some((child) => child.id === activeId),
    )?.id;
  }, [activeId, items]);

  return (
    <nav className="education-toc" aria-label="Education table of contents">
      <p className="education-toc__title">Contents</p>
      <ol className="education-toc__list">
        {items.map((item) => {
          const expanded = activeRoot === item.id && Boolean(item.children?.length);
          return (
            <li className="education-toc__item" key={item.id}>
              <a
                className={`education-toc__link${item.id === activeId ? ' education-toc__link--active' : ''}`}
                href={`#${item.id}`}
                aria-current={item.id === activeId ? 'location' : undefined}
                aria-expanded={item.children?.length ? expanded : undefined}
              >
                {item.text}
              </a>
              {item.children?.length ? (
                <div
                  className={`education-toc__branch${expanded ? ' education-toc__branch--expanded' : ''}`}
                  aria-hidden={!expanded}
                >
                  <div className="education-toc__branch-inner">
                    <ol className="education-toc__sublist">
                      {item.children.map((child) => (
                        <li className="education-toc__item" key={child.id}>
                          <a
                            className={`education-toc__link education-toc__link--child${child.id === activeId ? ' education-toc__link--active' : ''}`}
                            href={`#${child.id}`}
                            aria-current={child.id === activeId ? 'location' : undefined}
                            tabIndex={expanded ? undefined : -1}
                          >
                            {child.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
