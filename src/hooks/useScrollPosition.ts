import { useEffect, useState } from 'react';

/**
 * 监听页面纵向滚动位置，并转换为简单布尔状态，组件无需自行操作事件监听器。
 * @param threshold 超过多少像素后视为已滚动，默认 240。
 * @returns 当前是否已经越过阈值。
 */
export function useScrollPosition(threshold = 240): boolean {
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  useEffect(() => {
    /** 根据浏览器滚动值更新状态，并通过 passive 监听避免阻塞滚动。 */
    const handleScroll = (): void => setIsPastThreshold(window.scrollY > threshold);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isPastThreshold;
}
