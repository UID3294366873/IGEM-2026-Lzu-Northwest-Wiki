import { Fragment, type ReactNode } from 'react';
import { EntrepreneurshipTableOfContents } from '../components/navigation/EntrepreneurshipTableOfContents';
import type { EntrepreneurshipTocItem } from '../components/navigation/EntrepreneurshipTableOfContents';
import { PageLayout } from '../components/layout/PageLayout';
import businessPlanPdfUrl from '../assets/documents/entrepreneurship/entrepreneurship-business-plan.pdf?url';
import entrepreneurshipContent from '../data/entrepreneurshipContent.json';
import igemAssetUrls from '../data/igemAssetUrls.json';

interface RichSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  superscript?: boolean;
  subscript?: boolean;
}

interface ContentImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface ParagraphBlock {
  type: 'paragraph' | 'caption';
  text: string;
  segments: RichSegment[];
  list?: { kind: 'bullet'; level: number };
  images?: ContentImage[];
}

interface HeadingBlock {
  type: 'heading';
  text: string;
  number: string;
  level: number;
  id: string;
}

interface TableBlock {
  type: 'table';
  mediaLayout?: 'equal-pair' | 'partners';
  rows: Array<{
    cells: Array<{
      paragraphs: ParagraphBlock[];
    }>;
  }>;
}

type ContentBlock = ParagraphBlock | HeadingBlock | TableBlock;

interface EntrepreneurshipContent {
  toc: EntrepreneurshipTocItem[];
  headingIds: string[];
  blocks: ContentBlock[];
}

const content = entrepreneurshipContent as EntrepreneurshipContent;

/**
 * 优先使用 iGEM Uploads 正式地址，未上传时回退到项目内的图片目录。
 * @param filename 资源清单中的逻辑文件名。
 * @returns 可直接用于 img src 的正式或本地资源地址。
 */
function imageUrl(filename: string): string {
  const hostedUrl = (igemAssetUrls as Record<string, string>)[filename];
  const localUrl = `${import.meta.env.BASE_URL}images/entrepreneurship/${encodeURIComponent(filename)}`;
  return hostedUrl || localUrl;
}

/**
 * 保留 Word 中的基础行内强调格式。
 * @param segments 段落内按顺序排列的文字片段。
 * @param fallback 未分段时使用的完整文字。
 * @returns React 行内节点。
 */
function renderRichText(segments: RichSegment[], fallback: string): ReactNode {
  if (segments.length === 0) return fallback;
  return segments.map((segment, index) => {
    let node: ReactNode = segment.text;
    if (segment.bold) node = <strong>{node}</strong>;
    if (segment.italic) node = <em>{node}</em>;
    if (segment.underline) node = <u>{node}</u>;
    if (segment.superscript) node = <sup>{node}</sup>;
    if (segment.subscript) node = <sub>{node}</sub>;
    return <Fragment key={`${segment.text.slice(0, 12)}-${index}`}>{node}</Fragment>;
  });
}

/**
 * 渲染 Word 中位于当前块位置的图片。
 * @param images 当前段落或表格单元格中的图片。
 * @param keyPrefix React key 前缀。
 * @returns 保持文档顺序的图片节点。
 */
function renderImages(images: ContentImage[] | undefined, keyPrefix: string): ReactNode {
  if (!images?.length) return null;
  return images.map((image, index) => {
    const src = imageUrl(image.src);
    if (!src) return null;
    return (
      <figure
        className="entrepreneurship-document__figure"
        key={`${keyPrefix}-${image.src}-${index}`}
      >
        <img loading="lazy" src={src} alt={image.alt} width={image.width} height={image.height} />
      </figure>
    );
  });
}

/**
 * 渲染表格单元格中的段落和图片。
 * @param paragraphs 单元格内按 Word 顺序保存的段落。
 * @param keyPrefix React key 前缀。
 * @returns 单元格内容。
 */
function renderCellContent(paragraphs: ParagraphBlock[], keyPrefix: string): ReactNode {
  return paragraphs.map((paragraph, index) => (
    <Fragment key={`${keyPrefix}-${index}`}>
      {paragraph.text ? <p>{renderRichText(paragraph.segments, paragraph.text)}</p> : null}
      {renderImages(paragraph.images, `${keyPrefix}-${index}`)}
    </Fragment>
  ));
}

/**
 * 按 Word 中的四行双列结构渲染合作机构标识。
 * @param block Figure 8 的媒体表格。
 * @param blockIndex 正文中的块序号。
 * @returns 保留行、列和单元格内组合关系的标识网格。
 */
function renderPartnersMediaTable(block: TableBlock, blockIndex: number): ReactNode {
  return (
    <div className="entrepreneurship-document__partners-grid">
      {block.rows.map((row, rowIndex) => (
        <div
          className="entrepreneurship-document__partners-row"
          key={`partners-row-${blockIndex}-${rowIndex}`}
        >
          {row.cells.map((cell, cellIndex) => {
            const images = cell.paragraphs.flatMap((paragraph) => paragraph.images ?? []);
            return (
              <div
                className="entrepreneurship-document__partners-cell"
                key={`partners-cell-${blockIndex}-${rowIndex}-${cellIndex}`}
              >
                {renderImages(images, `partners-${blockIndex}-${rowIndex}-${cellIndex}`)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * 区分数据表与仅用于并排图片的 Word 表格并进行语义化渲染。
 * @param block 表格内容块。
 * @param blockIndex 正文中的块序号。
 * @returns 表格或图片网格。
 */
function renderTable(block: TableBlock, blockIndex: number): ReactNode {
  const cellParagraphs = block.rows.flatMap((row) => row.cells.flatMap((cell) => cell.paragraphs));
  const images = cellParagraphs.flatMap((paragraph) => paragraph.images ?? []);
  const hasCellText = cellParagraphs.some((paragraph) => paragraph.text.length > 0);

  if (!hasCellText && block.mediaLayout === 'partners') {
    return renderPartnersMediaTable(block, blockIndex);
  }

  if (!hasCellText && images.length > 0) {
    return (
      <div
        className={`entrepreneurship-document__media-grid${block.mediaLayout === 'equal-pair' ? ' entrepreneurship-document__media-grid--equal-pair' : ''}`}
      >
        {renderImages(images, `media-table-${blockIndex}`)}
      </div>
    );
  }

  return (
    <div className="entrepreneurship-document__table-wrap">
      <table className="entrepreneurship-document__table">
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`row-${blockIndex}-${rowIndex}`}>
              {row.cells.map((cell, cellIndex) => {
                const CellTag = rowIndex === 0 ? 'th' : 'td';
                return (
                  <CellTag key={`cell-${blockIndex}-${rowIndex}-${cellIndex}`}>
                    {renderCellContent(
                      cell.paragraphs,
                      `cell-${blockIndex}-${rowIndex}-${cellIndex}`,
                    )}
                  </CellTag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 将结构化 Word 内容块转为页面节点。
 * @param block 正文内容块。
 * @param index 正文中的块序号。
 * @returns 对应的语义化页面节点。
 */
function renderBlock(block: ContentBlock, index: number): ReactNode {
  if (block.type === 'heading') {
    if (block.level === 2)
      return (
        <h2 className="entrepreneurship-document__h2" id={block.id} key={block.id}>
          {block.text}
        </h2>
      );
    if (block.level === 3)
      return (
        <h3 className="entrepreneurship-document__h3" id={block.id} key={block.id}>
          {block.text}
        </h3>
      );
    return (
      <h4 className="entrepreneurship-document__h4" id={block.id} key={block.id}>
        {block.text}
      </h4>
    );
  }

  if (block.type === 'table')
    return <Fragment key={`table-${index}`}>{renderTable(block, index)}</Fragment>;

  return (
    <Fragment key={`${block.type}-${index}`}>
      {block.text ? (
        <p
          className={
            block.type === 'caption'
              ? 'entrepreneurship-document__caption'
              : block.list
                ? 'entrepreneurship-document__list-item'
                : undefined
          }
        >
          {renderRichText(block.segments, block.text)}
        </p>
      ) : null}
      {renderImages(block.images, `block-${index}`)}
    </Fragment>
  );
}

/**
 * 呈现完整商业计划书以及与滚动位置联动的分级目录。
 * @returns Entrepreneurship 页面。
 */
export function EntrepreneurshipPage() {
  return (
    <PageLayout
      title="Entrepreneurship"
      lead="Sybio-Gutweaver business plan and commercialization pathway."
      group="Engagement"
      pageClassName="wiki-page--entrepreneurship"
      sidebar={
        <EntrepreneurshipTableOfContents items={content.toc} headingIds={content.headingIds} />
      }
    >
      <div className="entrepreneurship-document">
        {content.blocks.map((block, index) => renderBlock(block, index))}
        <section aria-labelledby="section-12">
          <h2 className="entrepreneurship-document__h2" id="section-12">
            12 Business Plan
          </h2>
          <p>
            For the complete business plan, including detailed market analysis, financial
            projections, and risk controls, download the PDF below.
          </p>
          <p>
            <a href={businessPlanPdfUrl} download="entrepreneurship-business-plan.pdf">
              Download the Full Business Plan (PDF, 2.2 MB)
            </a>
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
