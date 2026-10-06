import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * 展示项目入口、核心指标和站点信息架构示例。
 * @returns 线框图风格首页内容。
 */
export function HomePage() {
  useDocumentTitle('首页');

  return (
    <main className="home-page" id="main-content" tabIndex={-1}>
      <section className="home-hero" aria-labelledby="home-title">
        <p className="home-hero__eyebrow">LZU-Northwest · iGEM 2026</p>
        <h1 id="home-title">Sybio-Gutweaver</h1>
        <p className="home-hero__lead">
          面向放疗相关急性肠损伤的工程化口服活菌候选方案，将抗氧化、屏障支持、可控黏附与双重生物安全机制整合到同一系统中。
        </p>
        <Link className="home-hero__action" to="/entrepreneurship">
          了解项目方案 →
        </Link>
      </section>
      <section className="home-process" aria-labelledby="process-title">
        <h2 id="process-title">从工程设计到可验证证据</h2>
        <div className="home-process__canvas">
          <article className="home-process__step home-process__step--left">
            <strong>01 / Sense</strong>
            <p>检测目标信号，明确系统输入。</p>
          </article>
          <article className="home-process__step home-process__step--right">
            <strong>02 / Process</strong>
            <p>通过生物模块完成信号转换。</p>
          </article>
          <article className="home-process__step home-process__step--left home-process__step--wide">
            <strong>03 / Validate</strong>
            <p>用实验结果验证设计假设与边界。</p>
          </article>
          <article className="home-process__step home-process__step--right home-process__step--wide">
            <strong>04 / Iterate</strong>
            <p>依据证据进入下一轮工程循环。</p>
          </article>
          <article className="home-process__step home-process__step--left home-process__step--wide">
            <strong>05 / Report</strong>
            <p>输出可解释、可复现的项目结果。</p>
          </article>
        </div>
      </section>
      <section className="home-pathways" aria-labelledby="pathways-title">
        <h2 id="pathways-title">我们具体做了什么？</h2>
        <div className="home-pathways__grid">
          {[
            ['Project', '商业化路径', '/entrepreneurship'],
            ['Practice', '整合式人类实践', '/human-practices'],
            ['Engagement', '教育与公众参与', '/Education'],
            ['Team', '成员与分工', '/team'],
          ].map(([eyebrow, title, path]) => (
            <Link className="home-pathway-card" to={path} key={path}>
              <span className="home-pathway-card__media" aria-hidden="true" />
              <small>{eyebrow}</small>
              <strong>{title}</strong>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
