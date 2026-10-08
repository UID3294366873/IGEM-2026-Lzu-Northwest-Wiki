interface PdfDocument {
  label: string;
  title: string;
  url: string;
}

interface PdfPairViewerProps {
  ariaLabel: string;
  leftDocument: PdfDocument;
  rightDocument: PdfDocument;
}

/** 在两个独立的固定视口中并排展示 PDF 文档。 */
export function PdfPairViewer({ ariaLabel, leftDocument, rightDocument }: PdfPairViewerProps) {
  const documents = [leftDocument, rightDocument];

  return (
    <section className="pdf-comparison" aria-label={ariaLabel}>
      <div className="pdf-comparison__grid">
        {documents.map((document) => (
          <article className="pdf-comparison__panel" key={document.label}>
            <header className="pdf-comparison__header">
              <div>
                <span className="pdf-comparison__label">{document.label}</span>
                <h4>{document.title}</h4>
              </div>
              <a
                href={document.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`在新窗口打开${document.label}`}
                title="在新窗口打开"
              >
                <span aria-hidden="true">↗</span>
              </a>
            </header>
            <div className="pdf-comparison__viewport">
              <iframe
                src={`${document.url}#view=FitH&pagemode=none`}
                title={`${document.label}：${document.title}`}
                loading="lazy"
              >
                <p>
                  当前浏览器无法内嵌显示 PDF。<a href={document.url}>打开文档</a>
                </p>
              </iframe>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
