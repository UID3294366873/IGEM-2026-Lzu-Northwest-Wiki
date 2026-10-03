import { Fragment, type ReactNode } from 'react';
import { EntrepreneurshipTableOfContents } from '../components/navigation/EntrepreneurshipTableOfContents';
import type { EntrepreneurshipTocItem } from '../components/navigation/EntrepreneurshipTableOfContents';
import { PageLayout } from '../components/layout/PageLayout';
import entrepreneurshipContent from '../data/entrepreneurshipContent.json';

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
 * 添加 Vite base 路径，确保本地与 iGEM 子路径部署都能加载静态图片。
 * @param filename 独立图片目录中的文件名。
 * @returns 可直接用于 img src 的地址。
 */
function imageUrl(filename: string): string {
  return `${import.meta.env.BASE_URL}images/entrepreneurship/${filename}`;
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
  return images.map((image, index) => (
    <figure
      className="entrepreneurship-document__figure"
      key={`${keyPrefix}-${image.src}-${index}`}
    >
      <img loading="lazy" src={imageUrl(image.src)} alt={image.alt} />
    </figure>
  ));
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
 * 区分数据表与仅用于并排图片的 Word 表格并进行语义化渲染。
 * @param block 表格内容块。
 * @param blockIndex 正文中的块序号。
 * @returns 表格或图片网格。
 */
function renderTable(block: TableBlock, blockIndex: number): ReactNode {
  const cellParagraphs = block.rows.flatMap((row) => row.cells.flatMap((cell) => cell.paragraphs));
  const images = cellParagraphs.flatMap((paragraph) => paragraph.images ?? []);
  const hasCellText = cellParagraphs.some((paragraph) => paragraph.text.length > 0);

  if (!hasCellText && images.length > 0) {
    const isCcicPair =
      images.length === 2 &&
      images.some((image) => image.src === 'image36.jpeg') &&
      images.some((image) => image.src === 'image37.jpeg');
    return (
      <div
        className={`entrepreneurship-document__media-grid${isCcicPair ? ' entrepreneurship-document__media-grid--equal-pair' : ''}`}
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
      </div>
    </PageLayout>
  );
}
