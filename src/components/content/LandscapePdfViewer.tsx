interface LandscapePdfViewerProps {
  pdfUrl: string;
  label: string;
  title: string;
}

/** 以居中横向视口完整展示 PDF 单页。 */
export function LandscapePdfViewer({ pdfUrl, label, title }: LandscapePdfViewerProps) {
  return (
    <section className="landscape-pdf" aria-label={`${title} PDF 查看器`}>
      <header className="landscape-pdf__header">
        <div>
          <span className="pdf-comparison__label">{label}</span>
          <h4>{title}</h4>
        </div>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`在新窗口打开${title}`}
          title="在新窗口打开"
        >
          <span aria-hidden="true">↗</span>
        </a>
      </header>
      <div className="landscape-pdf__viewport">
        <iframe
          src={`${pdfUrl}#page=1&view=Fit&pagemode=none&toolbar=0&navpanes=0`}
          title={title}
          loading="lazy"
        >
          <p>
            当前浏览器无法内嵌显示 PDF。<a href={pdfUrl}>打开文档</a>
          </p>
        </iframe>
      </div>
    </section>
  );
}
