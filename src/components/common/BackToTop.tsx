import { useScrollPosition } from '../../hooks/useScrollPosition';

/**
 * 在滚动超过阈值时显示回到顶部按钮，滚动逻辑由 Hook 独立维护。
 * @returns 回到顶部按钮或 null。
 */
export function BackToTop() {
  const visible = useScrollPosition();

  /** 平滑滚动到文档顶部，并交由浏览器尊重用户的 reduced-motion 设置。 */
  const scrollToTop = (): void => window.scrollTo({ top: 0, behavior: 'smooth' });
  return visible ? (
    <button className="back-to-top" type="button" onClick={scrollToTop}>
      回到顶部
    </button>
  ) : null;
}
