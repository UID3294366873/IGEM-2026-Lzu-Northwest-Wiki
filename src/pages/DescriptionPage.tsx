import { Accordion } from '../components/common/Accordion';
import { Badge } from '../components/common/Badge';
import { Callout } from '../components/common/Callout';
import { Card } from '../components/common/Card';
import { QuoteBlock } from '../components/common/QuoteBlock';
import { SectionHeading } from '../components/common/SectionHeading';
import { PageLayout } from '../components/layout/PageLayout';

const sections = [
  { id: 'problem', label: '问题定义' },
  { id: 'solution', label: '方案框架' },
  { id: 'impact', label: '影响与边界' },
  { id: 'questions', label: '关键问题' },
];

/**
 * 展示项目背景、方案、反馈与风险问题的完整内容骨架。
 * @returns 项目描述页。
 */
export function DescriptionPage() {
  return (
    <PageLayout
      title="Project Description"
      lead="说明为什么选择这个问题，以及合成生物学方案如何回应它。"
      group="Project"
      sections={sections}
      pageClassName="wiki-page--description"
    >
      <section className="content-section" id="problem">
        <SectionHeading
          eyebrow="01 / Context"
          title="我们正在解决什么？"
          description="先呈现问题规模和受影响群体，再引出技术方案。"
        />
        <div className="split-panel">
          <div>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing
              elit。正式版本应包含可靠的一手数据、文献引用和当地情境。
            </p>
            <Callout title="证据插槽" tone="warning">
              <p>在此链接正式来源，并说明数字对应的年份、地区和统计口径。</p>
            </Callout>
          </div>
          <div className="media-placeholder" role="img" aria-label="问题背景图表预留区域">
            FIGURE 01
            <br />
            PROBLEM SCALE
          </div>
        </div>
      </section>
      <section className="content-section" id="solution">
        <SectionHeading eyebrow="02 / Approach" title="方案如何工作？" />
        <div className="process-grid">
          <Card title="01 / Sense" headingLevel={3}>
            <Badge>INPUT</Badge>
            <p>检测目标信号，定义灵敏度与特异性边界。</p>
          </Card>
          <Card title="02 / Process" headingLevel={3}>
            <Badge>LOGIC</Badge>
            <p>通过生物模块完成可测量的信号转换。</p>
          </Card>
          <Card title="03 / Report" headingLevel={3}>
            <Badge>OUTPUT</Badge>
            <p>输出易于验证、解释和复现的结果。</p>
          </Card>
        </div>
      </section>
      <section className="content-section" id="impact">
        <SectionHeading eyebrow="03 / Responsibility" title="影响、反馈与实施边界" />
        <QuoteBlock
          quote="真正有用的系统不仅要在实验室工作，还必须能被目标使用者理解和维护。"
          author="模拟利益相关方"
          context="需求访谈占位内容"
        />
        <div className="card-grid card-grid--two">
          <Card title="预期价值" headingLevel={3}>
            <p>说明谁会受益、如何衡量成效、哪些变化可以合理归因于项目。</p>
          </Card>
          <Card title="已知边界" headingLevel={3}>
            <p>说明技术尚不能解决什么、安全条件、规模化障碍和下一步验证。</p>
          </Card>
        </div>
      </section>
      <section className="content-section" id="questions">
        <SectionHeading eyebrow="04 / FAQ" title="评审可能追问的问题" />
        <Accordion
          items={[
            {
              id: 'q1',
              title: '为什么必须使用合成生物学？',
              content: '对比非生物方案，并解释选择当前技术路线的必要性。',
            },
            {
              id: 'q2',
              title: '最关键的设计假设是什么？',
              content: '列出假设、验证方法和失败时的备选路径。',
            },
            {
              id: 'q3',
              title: '如何确保项目负责任？',
              content: '展示安全、伦理、可及性和利益相关方反馈如何改变设计。',
            },
          ]}
        />
      </section>
    </PageLayout>
  );
}
