/**
 * 校验生产内容中的远程静态资源是否来自 iGEM 官方静态域名。
 * @param url 待校验的资源地址。
 * @returns 地址为空、本地开发路径或属于 `static.igem.wiki` 时返回 true。
 */
export function isAllowedStaticAsset(url: string): boolean {
  if (!url || url.startsWith('/')) return true;
  try {
    return new URL(url).hostname === 'static.igem.wiki';
  } catch {
    return false;
  }
}
