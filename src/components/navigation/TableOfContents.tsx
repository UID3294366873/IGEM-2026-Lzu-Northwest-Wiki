import { useActiveSection } from '../../hooks/useActiveSection';
import type { PageSection } from '../../types/navigation';

/** 页内目录属性。 */
interface TableOfContentsProps {
  sections: PageSection[];
}

/**
 * 根据章节 id 渲染页内目录，并标记当前进入视口的章节。
 * @param props 页面章节列表。
 * @returns 页内章节导航；无章节时返回 null。
 */
export function TableOfContents({ sections }: TableOfContentsProps) {
  const activeId = useActiveSection(sections.map((section) => section.id));
  if (sections.length === 0) return null;
  return (
    <nav className="table-of-contents" aria-label="本页目录">
      <p className="table-of-contents__title">On this page</p>
      <ol className="table-of-contents__list">
        {sections.map((section, index) => (
          <li className="table-of-contents__item" key={section.id}>
            <a
              className={`table-of-contents__link${activeId === section.id ? ' table-of-contents__link--active' : ''}`}
              href={`#${section.id}`}
              aria-current={activeId === section.id ? 'location' : undefined}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}.</span> {section.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
