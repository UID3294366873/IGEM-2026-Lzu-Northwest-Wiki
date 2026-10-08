interface ImagePdfPairViewerProps {
  imageUrl: string;
  imageAlt: string;
  pdfUrl: string;
  pdfLabel: string;
  pdfTitle: string;
}

/** 等高并排展示一张完整图片与一个可滚动 PDF 文档。 */
export function ImagePdfPairViewer({
  imageUrl,
  imageAlt,
  pdfUrl,
  pdfLabel,
  pdfTitle,
}: ImagePdfPairViewerProps) {
  return (
    <section className="image-pdf-pair" aria-label="科普文章海报与英文文章 PDF">
      <figure className="image-pdf-pair__image-panel">
        <img src={imageUrl} alt={imageAlt} loading="lazy" />
      </figure>
      <article className="image-pdf-pair__pdf-panel">
        <header className="pdf-comparison__header">
          <div>
            <span className="pdf-comparison__label">{pdfLabel}</span>
            <h4>{pdfTitle}</h4>
          </div>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="在新窗口打开英文科普文章"
            title="在新窗口打开"
          >
            <span aria-hidden="true">↗</span>
          </a>
        </header>
        <div className="image-pdf-pair__pdf-viewport">
          <iframe
            src={`${pdfUrl}#view=FitH&pagemode=none`}
            title={`英文科普文章：${pdfTitle}`}
            loading="lazy"
          >
            <p>
              当前浏览器无法内嵌显示 PDF。<a href={pdfUrl}>打开文档</a>
            </p>
          </iframe>
        </div>
      </article>
    </section>
  );
}
