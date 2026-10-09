import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { EducationTableOfContents } from '../components/navigation/EducationTableOfContents';
import type { EducationTocItem } from '../components/navigation/EducationTableOfContents';
import { PdfPairViewer } from '../components/content/PdfComparisonViewer';
import { ImagePdfPairViewer } from '../components/content/ImagePdfPairViewer';
import { LandscapePdfViewer } from '../components/content/LandscapePdfViewer';
import { CardCarousel } from '../components/content/CardCarousel';
import { ColorGuardTool } from '../components/content/ColorGuardTool';
import educationContent from '../data/educationContent.json';
import igemAssetUrls from '../data/igemAssetUrls.json';
import { bacteriaGuardianCards } from '../data/bacteriaGuardianCards';

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

interface CardCarouselBlock {
  type: 'card-carousel';
}

interface ColorGuardBlock {
  type: 'color-guard';
}

type EducationBlock = ParagraphBlock | HeadingBlock | CardCarouselBlock | ColorGuardBlock;

interface EducationContent {
  title: string;
  lead: string;
  toc: EducationTocItem[];
  headingIds: string[];
  blocks: EducationBlock[];
}

const content = educationContent as EducationContent;
const WORD_TEXT_WIDTH_EMU = 5_274_310;
const EDUCATION_ARTICLE_POSTER = 'Education -24.png';
const EDUCATION_ARTICLE_CAPTION = '图24 科普文章海报';
const EDUCATION_ARTICLE_PLACEHOLDER = '此处右侧的科普论文插入为网页文档';
const educationArticlePosterUrl = `${import.meta.env.BASE_URL}pages/education/images/content/${encodeURIComponent(EDUCATION_ARTICLE_POSTER)}`;
const educationArticlePdfUrl = `${import.meta.env.BASE_URL}pages/education/documents/science-communication-article-en.pdf`;
const BROCHURE_PDF_NOTE = '(小册子在附带pdf中）';
const multilingualBrochurePdfUrl = `${import.meta.env.BASE_URL}pages/education/documents/multilingual-brochure.pdf`;

const surveyDocuments = [
  {
    number: 1,
    title: 'iGEM 星宝特殊儿童学校生物与合成生物学科普活动调查问卷',
    resultTitle: '星宝特殊儿童学校科普活动问卷结果',
    questionnaireFile: 'questionnaire-1-xingbao.pdf',
    resultFile: 'result-1-xingbao.pdf',
  },
  {
    number: 2,
    title: '科研图表中的颜色友好性认知调查',
    resultTitle: '科研图表颜色友好性认知调查结果',
    questionnaireFile: 'questionnaire-2-color-accessibility.pdf',
    resultFile: 'result-2-color-accessibility.pdf',
  },
  {
    number: 3,
    title: 'iGEM 合成生物学辩论赛观众反馈调查问卷',
    resultTitle: '合成生物学辩论赛观众反馈调查结果',
    questionnaireFile: 'questionnaire-3-debate-feedback.pdf',
    resultFile: 'result-3-debate-feedback.pdf',
  },
  {
    number: 4,
    title: '探秘合成生物学：iGEM 海报科普调研问卷',
    resultTitle: 'iGEM 海报科普调研结果',
    questionnaireFile: 'questionnaire-4-poster-outreach.pdf',
    resultFile: 'result-4-poster-outreach.pdf',
  },
  {
    number: 5,
    title: 'iGEM 团队合成生物学线下摆摊科普活动调研问卷',
    resultTitle: '合成生物学线下摆摊科普活动调研结果',
    questionnaireFile: 'questionnaire-5-campus-outreach.pdf',
    resultFile: 'result-5-campus-outreach.pdf',
  },
] as const;

/** @returns public 目录中 Education PDF 的部署安全地址。 */
function publicDocumentUrl(filename: string): string {
  return `${import.meta.env.BASE_URL}pages/education/documents/${filename}`;
}

/** @returns Word 占位段落中标记的问卷编号。 */
function surveyNumberFromPlaceholder(text: string): number | undefined {
  const match = text.match(/(?:问卷|PDF)\s*([1-5])/i);
  return match ? Number(match[1]) : undefined;
}

/**
 * 优先使用已配置的 iGEM 静态地址，否则回退到部署基路径下的本地原图。
 * @param filename 图片文件名。
 * @returns 浏览器可加载的资源地址。
 */
function imageUrl(filename: string): string {
  const hostedUrl = (igemAssetUrls as Record<string, string>)[filename];
  return (
    hostedUrl ||
    `${import.meta.env.BASE_URL}pages/education/images/content/${encodeURIComponent(filename)}`
  );
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
  const { crop, widthEmu, placement } = image.wordLayout;
  const isCropped = crop.left > 0 || crop.top > 0 || crop.right > 0 || crop.bottom > 0;
  const visibleWidth = 100_000 - crop.left - crop.right;
  const visibleHeight = 100_000 - crop.top - crop.bottom;
  const figureStyle: CSSProperties = grouped
    ? { flexGrow: widthEmu, flexBasis: `${Math.min((widthEmu / WORD_TEXT_WIDTH_EMU) * 100, 100)}%` }
    : { maxWidth: `${Math.min((widthEmu / WORD_TEXT_WIDTH_EMU) * 100, 100)}%` };
  // The Word frame can have a different ratio from the source bitmap. Derive the
  // visible crop from the source pixels so responsive resizing never distorts it.
  const frameStyle: CSSProperties = {
    aspectRatio: `${image.width * visibleWidth} / ${image.height * visibleHeight}`,
  };
  const imageStyle: CSSProperties = {
    width: `${(100_000 / visibleWidth) * 100}%`,
    height: 'auto',
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
  if (block.type === 'card-carousel') {
    return (
      <CardCarousel cards={bacteriaGuardianCards} key="education-bacteria-guardian-carousel" />
    );
  }
  if (block.type === 'color-guard') {
    return <ColorGuardTool key="education-color-guard-tool" />;
  }
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
  const surveyNumber = surveyNumberFromPlaceholder(block.text);
  const survey = surveyDocuments.find((item) => item.number === surveyNumber);
  if (survey && /问卷内容和结果详看pdf/i.test(block.text)) {
    return (
      <PdfPairViewer
        key={`questionnaire-${survey.number}-pdf-comparison`}
        ariaLabel={`问卷 ${survey.number} 与调查结果 PDF 对照查看器`}
        leftDocument={{
          label: `问卷 ${String(survey.number).padStart(2, '0')}`,
          title: survey.title,
          url: publicDocumentUrl(survey.questionnaireFile),
        }}
        rightDocument={{
          label: `调查结果 ${String(survey.number).padStart(2, '0')}`,
          title: survey.resultTitle,
          url: publicDocumentUrl(survey.resultFile),
        }}
      />
    );
  }
  const grouped = block.mediaLayout === 'inline-group' && Boolean(block.images?.length);
  const imageNames = block.images?.map((image) => image.src).join('|') ?? '';
  if (imageNames === EDUCATION_ARTICLE_POSTER) {
    return (
      <ImagePdfPairViewer
        key="education-article-image-pdf-pair"
        imageUrl={educationArticlePosterUrl}
        imageAlt="From Radiation Protection to Gut Repair 英文科普文章海报"
        pdfUrl={educationArticlePdfUrl}
        pdfLabel="English article"
        pdfTitle="Radiation Hazards, Melanin and Lactate in Intestinal Repair"
      />
    );
  }
  if (
    block.text === EDUCATION_ARTICLE_CAPTION ||
    block.text === EDUCATION_ARTICLE_PLACEHOLDER ||
    block.text === '图5-7   ColorGuard 科学图像色彩友好工具界面'
  )
    return null;
  const equalHeight =
    imageNames === 'Education -12.jpeg|Education -13.jpeg' ||
    imageNames === 'Education -14.jpeg|Education -15.jpeg';
  const mediaGroupModifier =
    imageNames === 'Education -12.jpeg|Education -13.jpeg'
      ? ' education-document__media-group--figures-12-13'
      : imageNames === 'Education -14.jpeg|Education -15.jpeg'
        ? ' education-document__media-group--figures-14-15'
        : '';
  const groupStyle: CSSProperties | undefined =
    equalHeight && block.images
      ? {
          gridTemplateColumns: block.images
            .map((image) => {
              const { crop } = image.wordLayout;
              const visibleWidth = 100_000 - crop.left - crop.right;
              const visibleHeight = 100_000 - crop.top - crop.bottom;
              return `${(image.width * visibleWidth) / (image.height * visibleHeight)}fr`;
            })
            .join(' '),
        }
      : undefined;
  const includesBrochurePdf = block.text.includes(BROCHURE_PDF_NOTE);
  const displayText = includesBrochurePdf ? block.text.replace(BROCHURE_PDF_NOTE, '') : block.text;
  const displaySegments =
    block.type === 'caption'
      ? []
      : block.segments
          .map((segment) => ({
            ...segment,
            text: includesBrochurePdf ? segment.text.replace(BROCHURE_PDF_NOTE, '') : segment.text,
          }))
          .filter((segment) => segment.text);
  return (
    <Fragment key={`${block.type}-${index}`}>
      {displayText ? (
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
          {renderRichText(displaySegments, displayText)}
        </p>
      ) : null}
      {includesBrochurePdf ? (
        <LandscapePdfViewer
          pdfUrl={multilingualBrochurePdfUrl}
          label="11 languages"
          title="《从太空辐射到肠道健康》多语言科普小册子"
        />
      ) : null}
      {block.images?.length ? (
        <div
          className={
            grouped
              ? `education-document__media-group${equalHeight ? ' education-document__media-group--equal-height' : ''}${mediaGroupModifier}`
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
