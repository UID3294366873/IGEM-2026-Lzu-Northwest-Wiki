import { useCallback } from 'react';
import { AsyncStateView } from '../components/common/AsyncStateView';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { SectionHeading } from '../components/common/SectionHeading';
import { StatGrid } from '../components/common/StatGrid';
import { PageLayout } from '../components/layout/PageLayout';
import { teamMembers } from '../data/team';
import { useAsyncData } from '../hooks/useAsyncData';
import type { TeamMember } from '../types/content';

const sections = [
  { id: 'team-overview', label: '团队概览' },
  { id: 'members', label: '成员' },
  { id: 'collaboration', label: '协作方式' },
];
const isEmpty = (members: TeamMember[]): boolean => members.length === 0;

/**
 * 展示由数据驱动的团队成员列表及完整异步状态。
 * @returns 团队页面。
 */
export function TeamPage() {
  /** 模拟异步数据源；接入 API 时可在此替换为 fetch，不必改卡片结构。 */
  const loadMembers = useCallback(
    async (): Promise<TeamMember[]> => Promise.resolve(teamMembers),
    [],
  );
  const { state, retry } = useAsyncData(loadMembers, isEmpty);
  return (
    <PageLayout
      title="团队介绍"
      lead="跨学科协作不是一张合影，而是清晰的角色、责任和归因边界。"
      group="Team"
      sections={sections}
    >
      <section className="content-section" id="team-overview">
        <SectionHeading eyebrow="01 / People" title="一个团队，多种视角" />
        <StatGrid
          label="团队构成"
          items={[
            { value: '08', label: '学生成员' },
            { value: '03', label: '学科方向' },
            { value: '02', label: '指导老师' },
            { value: '01', label: '共同目标' },
          ]}
        />
      </section>
      <section className="content-section" id="members">
        <SectionHeading
          eyebrow="02 / Members"
          title="团队成员"
          description="成员由独立数据文件驱动，美术可自由替换卡片排版。"
        />
        {state.status === 'loading' ? <AsyncStateView status="loading" /> : null}
        {state.status === 'error' ? (
          <AsyncStateView status="error" message={state.error.message} onRetry={retry} />
        ) : null}
        {state.status === 'empty' ? <AsyncStateView status="empty" /> : null}
        {state.status === 'success' ? (
          <div className="card-grid card-grid--two">
            {state.data.map((member, index) => (
              <Card
                key={member.id}
                title={
                  <>
                    <span className="member-card__index">{String(index + 1).padStart(2, '0')}</span>
                    {member.name}
                  </>
                }
                headingLevel={3}
              >
                <div
                  className="member-card__portrait"
                  role="img"
                  aria-label={`${member.name} 的头像预留区域`}
                >
                  PORTRAIT
                </div>
                <Badge>{member.role}</Badge>
                <p>{member.bio}</p>
              </Card>
            ))}
          </div>
        ) : null}
      </section>
      <section className="content-section" id="collaboration">
        <SectionHeading eyebrow="03 / Workflow" title="我们如何协作" />
        <ol className="numbered-list">
          <li>
            <strong>每周对齐：</strong>同步假设、结果、阻塞和决策。
          </li>
          <li>
            <strong>双人复核：</strong>实验记录、数据和页面内容至少由两人检查。
          </li>
          <li>
            <strong>持续归因：</strong>贡献发生时记录，不在截止日前凭记忆补写。
          </li>
        </ol>
      </section>
    </PageLayout>
  );
}
