import { Link } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import { Callout } from '../components/common/Callout';
import { Card } from '../components/common/Card';
import { SectionHeading } from '../components/common/SectionHeading';
import { StatGrid } from '../components/common/StatGrid';
import { PageLayout } from '../components/layout/PageLayout';

const sections = [
  { id: 'overview', label: '项目概览' },
  { id: 'numbers', label: '关键数字' },
  { id: 'pathways', label: '探索路径' },
];

/**
 * 展示项目入口、核心指标和站点信息架构示例。
 * @returns 线框图风格首页内容。
 */
export function HomePage() {
  return (
    <PageLayout
      title="首页"
      lead="从真实问题出发，用可验证、可复现的工程循环构建 2026 iGEM 项目。"
      group="Overview"
      sections={sections}
    >
      <section className="hero-panel" id="overview">
        <div className="hero-panel__copy">
          <p className="hero-panel__index">PROJECT / 001</p>
          <h2 className="hero-panel__title">让每一次实验都成为下一轮设计的证据。</h2>
          <p className="hero-panel__description">
            这是团队核心叙事的占位区域。替换为一句清晰的问题定义、技术方案，以及项目为什么值得被完成。
          </p>
          <div className="hero-panel__actions">
            <Link className="button button--primary" to="/description">
              阅读项目描述 →
            </Link>
            <Link className="button button--secondary" to="/notebook">
              查看工程记录
            </Link>
          </div>
        </div>
        <div className="hero-panel__media" role="img" aria-label="项目主视觉预留区域">
          <span>IMAGE / DIAGRAM</span>
          <strong>16 : 10</strong>
          <small>上传至 static.igem.wiki 后替换</small>
        </div>
      </section>
      <section className="content-section" id="numbers">
        <SectionHeading
          eyebrow="01 / Evidence"
          title="项目快照"
          description="数字只是结构示例，正式内容必须能够被实验记录或引用证据支持。"
        />
        <StatGrid
          label="项目关键指标"
          items={[
            { value: '04', label: '工程迭代', detail: 'Design → Learn' },
            { value: '128', label: '实验记录', detail: '可检索条目' },
            { value: '12', label: '利益相关方', detail: '反馈已闭环' },
            { value: '03', label: '开放贡献', detail: '协议 / 数据 / 工具' },
          ]}
        />
        <Callout title="这是一套内容骨架">
          <p>
            当前组件强调信息层级、证据位置和交互状态。美术人员可只修改主题变量与 BEM
            样式，不需要重写逻辑。
          </p>
        </Callout>
      </section>
      <section className="content-section" id="pathways">
        <SectionHeading
          eyebrow="02 / Navigate"
          title="从哪里开始？"
          description="按评审阅读路径组织入口，而不是把所有内容堆在首页。"
        />
        <div className="card-grid card-grid--three">
          <Card
            title={
              <>
                <Badge>PROJECT</Badge> 问题与方案
              </>
            }
            headingLevel={3}
          >
            <p>从背景、需求和设计约束进入完整项目叙事。</p>
            <Link to="/description">查看项目描述 →</Link>
          </Card>
          <Card
            title={
              <>
                <Badge>TEAM</Badge> 人与协作
              </>
            }
            headingLevel={3}
          >
            <p>展示成员角色、归因边界和合作网络。</p>
            <Link to="/team">认识团队 →</Link>
          </Card>
          <Card
            title={
              <>
                <Badge>OUTPUT</Badge> 贡献与奖项
              </>
            }
            headingLevel={3}
          >
            <p>让可复现成果、证据和影响彼此对应。</p>
            <Link to="/contribution">查看贡献 →</Link>
          </Card>
        </div>
      </section>
    </PageLayout>
  );
}
