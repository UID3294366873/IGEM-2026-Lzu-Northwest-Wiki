import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { EducationTableOfContents } from '../components/navigation/EducationTableOfContents';
import type { EducationTocItem } from '../components/navigation/EducationTableOfContents';
import educationContent from '../data/educationContent.json';
import igemAssetUrls from '../data/igemAssetUrls.json';

interface RichSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  superscript?: boolean;
  subscript?: boolean;
}

interface EducationImage {
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
  type: 'paragraph' | 'caption';
  text: string;
  segments: RichSegment[];
  alignment?: string;
  mediaLayout?: 'single' | 'inline-group';
  images?: EducationImage[];
}

interface HeadingBlock {
  type: 'heading';
  text: string;
  level: number;
  id: string;
}

type EducationBlock = ParagraphBlock | HeadingBlock;

interface EducationContent {
  title: string;
  lead: string;
  toc: EducationTocItem[];
  headingIds: string[];
  blocks: EducationBlock[];
}

const content = educationContent as EducationContent;
const WORD_TEXT_WIDTH_EMU = 5_274_310;

/**
 * 优先使用已配置的 iGEM 静态地址，否则回退到部署基路径下的本地原图。
 * @param filename 图片文件名。
 * @returns 浏览器可加载的资源地址。
 */
function imageUrl(filename: string): string {
  const hostedUrl = (igemAssetUrls as Record<string, string>)[filename];
  return hostedUrl || `${import.meta.env.BASE_URL}images/education/${encodeURIComponent(filename)}`;
}

/**
 * 保留 Word 段落中的基础行内强调。
 * @param segments 富文本片段。
 * @param fallback 未分段时的完整文本。
 * @returns React 行内内容。
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
 * 使用容器裁剪还原 Word 的显示尺寸与四向裁剪，不修改原图。
 * @param image 图片与 Word 布局元数据。
 * @param key React key。
 * @param grouped 是否位于同段落图片组合中。
 * @returns 图片节点。
 */
function renderImage(image: EducationImage, key: string, grouped: boolean): ReactNode {
  const { crop, widthEmu, heightEmu, placement } = image.wordLayout;
  const isCropped = crop.left > 0 || crop.top > 0 || crop.right > 0 || crop.bottom > 0;
  const visibleWidth = 100_000 - crop.left - crop.right;
  const visibleHeight = 100_000 - crop.top - crop.bottom;
  const figureStyle: CSSProperties = grouped
    ? { flexGrow: widthEmu, flexBasis: `${Math.min((widthEmu / WORD_TEXT_WIDTH_EMU) * 100, 100)}%` }
    : { maxWidth: `${Math.min((widthEmu / WORD_TEXT_WIDTH_EMU) * 100, 100)}%` };
  const frameStyle: CSSProperties = { aspectRatio: `${widthEmu} / ${heightEmu}` };
  const imageStyle: CSSProperties = {
    width: `${(100_000 / visibleWidth) * 100}%`,
    height: `${(100_000 / visibleHeight) * 100}%`,
    left: `${(-crop.left / visibleWidth) * 100}%`,
    top: `${(-crop.top / visibleHeight) * 100}%`,
  };
  return (
    <figure
      className="education-document__figure"
      style={figureStyle}
      key={key}
      data-placement={placement}
      data-cropped={isCropped ? 'true' : 'false'}
      data-image-src={image.src}
    >
      <div className="education-document__image-frame" style={frameStyle}>
        <img
          src={imageUrl(image.src)}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          style={imageStyle}
        />
      </div>
    </figure>
  );
}

/**
 * 按 OOXML 顺序渲染标题、正文、说明和图片。
 * @param block 内容块。
 * @param index 内容块序号。
 * @returns 页面节点。
 */
function renderBlock(block: EducationBlock, index: number): ReactNode {
  if (block.type === 'heading') {
    return block.level === 1 ? (
      <h2 className="education-document__h2" id={block.id} key={block.id}>
        {block.text}
      </h2>
    ) : (
      <h3 className="education-document__h3" id={block.id} key={block.id}>
        {block.text}
      </h3>
    );
  }
  const grouped = block.mediaLayout === 'inline-group' && Boolean(block.images?.length);
  const imageNames = block.images?.map((image) => image.src).join('|') ?? '';
  const equalHeight =
    imageNames === 'Education -16.jpeg|Education -17.jpeg' ||
    imageNames === 'Education -18.jpeg|Education -19.jpeg';
  const groupStyle: CSSProperties | undefined =
    equalHeight && block.images
      ? {
          gridTemplateColumns: block.images
            .map((image) => `${image.wordLayout.widthEmu / image.wordLayout.heightEmu}fr`)
            .join(' '),
        }
      : undefined;
  return (
    <Fragment key={`${block.type}-${index}`}>
      {block.text ? (
        <p
          className={block.type === 'caption' ? 'education-document__caption' : undefined}
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
          {renderRichText(block.segments, block.text)}
        </p>
      ) : null}
      {block.images?.length ? (
        <div
          className={
            grouped
              ? `education-document__media-group${equalHeight ? ' education-document__media-group--equal-height' : ''}`
              : undefined
          }
          style={groupStyle}
        >
          {block.images.map((image, imageIndex) =>
            renderImage(image, `${image.src}-${imageIndex}`, grouped),
          )}
        </div>
      ) : null}
    </Fragment>
  );
}

/** @returns Word 内容顺序、图片布局与分级目录完整还原的 Education 页面。 */
export function EducationPage() {
  return (
    <PageLayout
      title={content.title}
      lead={content.lead}
      group="Human Practices"
      pageClassName="wiki-page--education"
      sidebar={<EducationTableOfContents items={content.toc} headingIds={content.headingIds} />}
    >
      <div className="education-document">
        {content.blocks.map((block, index) => renderBlock(block, index))}
      </div>
    </PageLayout>
  );
}
