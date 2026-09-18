import { useEffect } from 'react';

/**
 * 同步浏览器标题，避免每个页面重复操作 document。
 * @param pageTitle 当前页面标题。
 */
export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    const team = import.meta.env.VITE_TEAM_NAME || 'Example Team';
    const year = import.meta.env.VITE_TEAM_YEAR || '2026';
    document.title = `${pageTitle} | ${team} - iGEM ${year}`;
  }, [pageTitle]);
}
