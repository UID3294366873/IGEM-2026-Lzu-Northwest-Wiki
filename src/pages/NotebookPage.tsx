import { Badge } from '../components/common/Badge';
import { Callout } from '../components/common/Callout';
import { DataTable } from '../components/common/DataTable';
import { SectionHeading } from '../components/common/SectionHeading';
import { PageLayout } from '../components/layout/PageLayout';
import { timelineEvents } from '../data/timeline';

const sections = [
  { id: 'timeline', label: '时间线' },
  { id: 'records', label: '记录索引' },
  { id: 'reproducibility', label: '可复现清单' },
];

/**
 * 以时间线和数据表展示实验记录。
 * @returns 实验记录页。
 */
export function NotebookPage() {
  return (
    <PageLayout
      title="实验记录"
      lead="把过程、失败和决策完整记录下来，让结果可以被追溯与复现。"
      group="Lab"
      sections={sections}
    >
      <section className="content-section" id="timeline">
        <SectionHeading
          eyebrow="01 / Timeline"
          title="工程进度"
          description="每个节点应链接到原始记录、数据和对应的设计决策。"
        />
        <ol className="timeline">
          {timelineEvents.map((event, index) => (
            <li className="timeline__item" key={event.id}>
              <div className="timeline__marker" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </div>
              <article className="timeline__content">
                <div className="timeline__meta">
                  <time dateTime={event.date}>{event.date}</time>
                  <Badge tone={index === timelineEvents.length - 1 ? 'success' : 'neutral'}>
                    {index === timelineEvents.length - 1 ? 'CURRENT' : 'COMPLETE'}
                  </Badge>
                </div>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>
      <section className="content-section" id="records">
        <SectionHeading eyebrow="02 / Index" title="记录索引" />
        <DataTable
          caption="示例实验记录索引"
          columns={[
            { key: 'date', label: '日期' },
            { key: 'title', label: '记录' },
            { key: 'description', label: '摘要' },
          ]}
          rows={timelineEvents}
          getRowKey={(row) => row.id}
        />
      </section>
      <section className="content-section" id="reproducibility">
        <SectionHeading eyebrow="03 / Checklist" title="每条记录必须包含" />
        <div className="checklist">
          <label>
            <input type="checkbox" defaultChecked /> 目的与可检验假设
          </label>
          <label>
            <input type="checkbox" defaultChecked /> 材料、批次与完整步骤
          </label>
          <label>
            <input type="checkbox" /> 原始数据和分析脚本
          </label>
          <label>
            <input type="checkbox" /> 偏差、失败与下一步决策
          </label>
        </div>
        <Callout title="不要隐藏失败" tone="warning">
          <p>失败实验能够解释设计为何改变，也是工程闭环的重要证据。</p>
        </Callout>
      </section>
    </PageLayout>
  );
}
