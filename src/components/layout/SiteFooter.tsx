import { useLocation } from 'react-router-dom';
import { routeMetadata } from '../../data/navigation';

/**
 * 渲染所有页面共用页脚。仓库链接和 CC BY 4.0 许可信息是 iGEM Wiki 必备信息。
 * @returns 网站页脚。
 */
export function SiteFooter() {
  const year = import.meta.env.VITE_TEAM_YEAR || '2026';
  const slug = import.meta.env.VITE_TEAM_SLUG || 'lzu-northwest';
  const assetBase = `${import.meta.env.BASE_URL}shared/images/project-description-shell`;
  const { pathname } = useLocation();
  const route = routeMetadata.find((item) => item.path === pathname);
  const usesProjectDescriptionFooter =
    route?.footer === 'project-description' || route?.shell === 'project-description';
  return (
    <footer
      className={`site-footer${usesProjectDescriptionFooter ? ' site-footer--project-description' : ''}`}
    >
      {usesProjectDescriptionFooter ? (
        <>
          <div className="site-footer__project-description-art" aria-label="合作单位与社交媒体">
            <div className="site-footer__partners">
              <img src={`${assetBase}/lanzhou-university.png`} alt="Lanzhou University" />
              <img src={`${assetBase}/imp-cas.png`} alt="Institute of Modern Physics, CAS" />
              <img src={`${assetBase}/snapgene.png`} alt="SnapGene" />
              <img src={`${assetBase}/synbio-technologies.png`} alt="Synbio Technologies" />
              <img src={`${assetBase}/stomatology.png`} alt="School of Stomatology" />
              <img
                src={`${assetBase}/nuclear-physics.png`}
                alt="School of Nuclear Science and Technology"
              />
            </div>
            <div className="site-footer__social">
              <p>Contact us</p>
              <figure>
                <img src={`${assetBase}/rednote-qr.png`} alt="LZU-Northwest Rednote QR code" />
                <figcaption>rednote</figcaption>
              </figure>
              <figure>
                <img src={`${assetBase}/wechat-qr.png`} alt="LZU-Northwest WeChat QR code" />
                <figcaption>WeChat</figcaption>
              </figure>
            </div>
          </div>
          <img
            className="site-footer__project-description-divider"
            src={`${assetBase}/footer-line.svg`}
            alt=""
          />
        </>
      ) : null}
      {!usesProjectDescriptionFooter ? (
        <>
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
        </>
      ) : null}
    </footer>
  );
}
