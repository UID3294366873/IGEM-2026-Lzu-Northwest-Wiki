import { Accordion } from '../components/common/Accordion';
import { Link } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import { Callout } from '../components/common/Callout';
import { Card } from '../components/common/Card';
import { SectionHeading } from '../components/common/SectionHeading';
import { PageLayout } from '../components/layout/PageLayout';

const sections = [
  { id: 'outputs', label: '开放成果' },
  { id: 'evidence', label: '奖项证据' },
  { id: 'reuse', label: '复用说明' },
];

/**
 * 展示团队开放贡献、证据状态与复用说明。
 * @returns 贡献与奖项页。
 */
export function ContributionPage() {
  return (
    <PageLayout
      title="奖项与贡献"
      lead="贡献必须让未来团队能够找到、理解、验证并复用。"
      group="Project"
      sections={sections}
    >
      <section className="content-section" id="outputs">
        <SectionHeading
          eyebrow="01 / Outputs"
          title="开放成果"
          description="以下为结构示例，正式发布时补充稳定链接、版本和许可证。"
        />
        <div className="card-grid card-grid--three">
          <Card title="实验协议 v1.2" headingLevel={3}>
            <Badge tone="success">READY</Badge>
            <p>包含试剂、参数、对照和故障排查。</p>
            <a href="#reuse">查看复用说明 →</a>
          </Card>
          <Card title="示例数据集" headingLevel={3}>
            <Badge tone="warning">DRAFT</Badge>
            <p>包含原始数据、字段字典和处理记录。</p>
            <a href="#reuse">查看复用说明 →</a>
          </Card>
          <Card title="分析工具" headingLevel={3}>
            <Badge>PLANNED</Badge>
            <p>包含源码、输入输出示例和验证用例。</p>
            <a href="#reuse">查看复用说明 →</a>
          </Card>
        </div>
      </section>
      <section className="content-section" id="evidence">
        <SectionHeading eyebrow="02 / Judging" title="奖项证据矩阵" />
        <div className="evidence-grid">
          <div className="evidence-grid__header">CRITERION</div>
          <div className="evidence-grid__header">CLAIM</div>
          <div className="evidence-grid__header">EVIDENCE</div>
          <div>Engineering Success</div>
          <div>完成至少一轮可解释迭代</div>
          <div>
            <Link to="/notebook">Notebook / Cycle 02</Link>
          </div>
          <div>Contribution</div>
          <div>未来团队可复用协议与数据</div>
          <div>
            <a href="#outputs">Outputs / 01—03</a>
          </div>
        </div>
        <Callout title="提交前核验" tone="warning">
          <p>奖项名称和资格以 2026 Judging Handbook 为准，不应沿用历史页面文字。</p>
        </Callout>
      </section>
      <section className="content-section" id="reuse">
        <SectionHeading eyebrow="03 / Reuse" title="未来团队如何复用" />
        <Accordion
          items={[
            {
              id: 'reuse-1',
              title: '运行前需要什么？',
              content: '列出环境版本、材料、设备和输入数据要求。',
            },
            {
              id: 'reuse-2',
              title: '如何验证得到正确结果？',
              content: '提供预期输出、阳性/阴性对照和常见错误。',
            },
            {
              id: 'reuse-3',
              title: '如何引用和反馈？',
              content: '给出许可证、推荐引用格式、仓库与维护联系渠道。',
            },
          ]}
        />
      </section>
    </PageLayout>
  );
}
