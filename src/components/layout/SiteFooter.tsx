/**
 * 渲染所有页面共用页脚。仓库链接和 CC BY 4.0 许可信息是 iGEM Wiki 必备信息。
 * @returns 网站页脚。
 */
export function SiteFooter() {
  const year = import.meta.env.VITE_TEAM_YEAR || '2026';
  const slug = import.meta.env.VITE_TEAM_SLUG || 'lzu-northwest';
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <strong>[ iGEM / {year} ]</strong>
        <p>{import.meta.env.VITE_TEAM_NAME || 'LZU-Northwest'} Wiki</p>
      </div>
      <div className="site-footer__legal">
        <p>
          © {year} {import.meta.env.VITE_TEAM_NAME || 'LZU-Northwest'}。
        </p>
        <p>
          Wiki 内容采用 <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>{' '}
          许可；源码位于 <a href={`https://gitlab.igem.org/${year}/${slug}`}>iGEM GitLab</a>。
        </p>
      </div>
      <div className="site-footer__status">
        <span aria-hidden="true">●</span> STATIC BUILD / READY
      </div>
    </footer>
  );
}
