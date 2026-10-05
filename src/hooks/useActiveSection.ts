import { useEffect, useState } from 'react';

/**
 * 使用 IntersectionObserver 追踪当前可见章节，不依赖章节内部 DOM 结构。
 * @param sectionIds 需要观察的章节 id 列表。
 * @returns 当前最接近阅读位置的章节 id。
 */
export function useActiveSection(sectionIds: string[]): string {
  const [activeId, setActiveId] = useState('');
  const sectionKey = sectionIds.join('|');

  useEffect(() => {
    const ids = sectionKey.split('|').filter(Boolean);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const readingLine = window.scrollY + Math.min(window.innerHeight * 0.28, 220);
      let nextId = '';
      for (const element of elements) {
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        if (elementTop > readingLine) break;
        nextId = element.id;
      }
      const reachedDocumentEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (reachedDocumentEnd) nextId = elements.at(-1)?.id ?? nextId;
      setActiveId((currentId) => (currentId === nextId ? currentId : nextId));
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('hashchange', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      window.removeEventListener('hashchange', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sectionKey]);

  return activeId;
}
