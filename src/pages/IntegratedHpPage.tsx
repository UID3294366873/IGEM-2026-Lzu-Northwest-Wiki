import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { IntegratedHpTableOfContents } from '../components/navigation/IntegratedHpTableOfContents';
import type { IntegratedHpTocItem } from '../components/navigation/IntegratedHpTableOfContents';
import igemAssetUrls from '../data/igemAssetUrls.json';
import integratedHpContent from '../data/integratedHpContent.json';

interface RichSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  superscript?: boolean;
  subscript?: boolean;
}

interface IntegratedHpImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  wordLayout: {
    widthEmu: number;
    heightEmu: number;
    crop: { left: number; top: number; right: number; bottom: number };
    placement: 'inline' | 'anchor';
  };
}

interface ParagraphBlock {
  type: 'paragraph';
  text: string;
  segments: RichSegment[];
  alignment?: string;
  images?: IntegratedHpImage[];
}

interface HeadingBlock {
  type: 'heading';
  text: string;
  level: number;
  id: string;
}

type IntegratedHpBlock = ParagraphBlock | HeadingBlock;

interface IntegratedHpContent {
  title: string;
  lead: string;
  toc: IntegratedHpTocItem[];
  headingIds: string[];
  blocks: IntegratedHpBlock[];
}

const content = integratedHpContent as IntegratedHpContent;
const WORD_TEXT_WIDTH_EMU = 5_494_020;

/**
 * 优先使用 iGEM 正式地址，否则使用部署基路径下的本地原图。
 * @param filename 图片文件名。
 * @returns 浏览器资源地址。
 */
function imageUrl(filename: string): string {
  const hostedUrl = (igemAssetUrls as Record<string, string>)[filename];
  return hostedUrl || `${import.meta.env.BASE_URL}images/ihp/${encodeURIComponent(filename)}`;
}

/**
 * 保留 Word 段落中的基础行内格式。
 * @param segments 富文本片段。
 * @param fallback 完整段落文字。
 * @returns React 行内节点。
 */
function renderRichText(segments: RichSegment[], fallback: string): ReactNode {
  if (!segments.length) return fallback;
  return segments.map((segment, index) => {
    let node: ReactNode = segment.text;
    if (segment.bold) node = <strong>{node}</strong>;
    if (segment.italic) node = <em>{node}</em>;
    if (segment.underline) node = <u>{node}</u>;
    if (segment.superscript) node = <sup>{node}</sup>;
    if (segment.subscript) node = <sub>{node}</sub>;
    return <Fragment key={`${index}-${segment.text.slice(0, 12)}`}>{node}</Fragment>;
  });
}

/**
 * 按 Word 显示宽高和裁剪参数渲染原图。
 * @param image 图片与 OOXML 布局信息。
 * @returns 图片节点。
 */
function renderImage(image: IntegratedHpImage): ReactNode {
  const { crop, widthEmu, heightEmu, placement } = image.wordLayout;
  const visibleWidth = 100_000 - crop.left - crop.right;
  const visibleHeight = 100_000 - crop.top - crop.bottom;
  const cropped = crop.left > 0 || crop.top > 0 || crop.right > 0 || crop.bottom > 0;
  return (
    <figure
      className="education-document__figure"
      style={{ maxWidth: `${Math.min((widthEmu / WORD_TEXT_WIDTH_EMU) * 100, 100)}%` }}
      data-image-src={image.src}
      data-cropped={cropped ? 'true' : 'false'}
      data-placement={placement}
      key={image.src}
    >
      <div
        className="education-document__image-frame"
        style={{ aspectRatio: `${widthEmu} / ${heightEmu}` }}
      >
        <img
          src={imageUrl(image.src)}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          style={{
            width: `${(100_000 / visibleWidth) * 100}%`,
            height: `${(100_000 / visibleHeight) * 100}%`,
            left: `${(-crop.left / visibleWidth) * 100}%`,
            top: `${(-crop.top / visibleHeight) * 100}%`,
          }}
        />
      </div>
    </figure>
  );
}

/**
 * 按文档顺序渲染标题、正文、链接和图片。
 * @param block 内容块。
 * @param index 内容块序号。
 * @returns 页面节点。
 */
function renderBlock(block: IntegratedHpBlock, index: number): ReactNode {
  if (block.type === 'heading') {
    if (block.level === 1)
      return (
        <h2 className="education-document__h2" id={block.id} key={block.id}>
          {block.text}
        </h2>
      );
    if (block.level === 2)
      return (
        <h3 className="education-document__h3" id={block.id} key={block.id}>
          {block.text}
        </h3>
      );
    return (
      <h4 className="education-document__h4" id={block.id} key={block.id}>
        {block.text}
      </h4>
    );
  }
  const isUrl = /^https?:\/\/\S+$/.test(block.text);
  return (
    <Fragment key={`paragraph-${index}`}>
      {block.text ? (
        <p
          style={
            block.alignment
              ? {
                  textAlign:
                    block.alignment === 'both'
                      ? 'justify'
                      : (block.alignment as CSSProperties['textAlign']),
                }
              : undefined
          }
        >
          {isUrl ? (
            <a href={block.text}>{block.text}</a>
          ) : (
            renderRichText(block.segments, block.text)
          )}
        </p>
      ) : null}
      {block.images?.map((image) => renderImage(image))}
    </Fragment>
  );
}

/** @returns Integrated Human Practices 页面。 */
export function IntegratedHpPage() {
  return (
    <PageLayout
      title={content.title}
      lead={content.lead}
      group="Human Practices"
      pageClassName="wiki-page--ihp"
      sidebar={<IntegratedHpTableOfContents items={content.toc} headingIds={content.headingIds} />}
    >
      <div className="education-document ihp-document">
        {content.blocks.map((block, index) => renderBlock(block, index))}
      </div>
    </PageLayout>
  );
}
