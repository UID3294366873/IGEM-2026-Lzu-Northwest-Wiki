import { useEffect, useRef, useState } from 'react';
import { teamMembers } from '../data/team';
import { useActiveSection } from '../hooks/useActiveSection';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { TeamGroupId, TeamMember } from '../types/content';

interface TeamGroupDefinition {
  id: TeamGroupId;
  eyebrow: string;
  title: string;
  slots: number;
}

const teamGroups: TeamGroupDefinition[] = [
  { id: 'primary-pis', eyebrow: 'Team PIs', title: 'PRIMARY PIs', slots: 1 },
  { id: 'secondary-pis', eyebrow: 'Team PIs', title: 'SECONDARY PIs', slots: 4 },
  { id: 'student-leaders', eyebrow: '', title: 'STUDENT LEADERS', slots: 3 },
  { id: 'student-members', eyebrow: '', title: 'STUDENT TEAM MEMBERS', slots: 28 },
];

const sectionIds = teamGroups.map((group) => group.id);
const memberDividerUrl = `${import.meta.env.BASE_URL}images/team/member-divider.svg`;
const detailDividerUrl = `${import.meta.env.BASE_URL}images/team/detail-divider.svg`;

/**
 * 把已核验成员放入对应分组，其余设计卡位保持匿名占位。
 * @param group 分组配置。
 * @returns 与 Figma 卡片数量一致的成员槽位。
 */
function getGroupSlots(group: TeamGroupDefinition): Array<TeamMember | null> {
  const members = teamMembers.filter((member) => member.group === group.id).slice(0, group.slots);
  return [...members, ...Array<TeamMember | null>(group.slots - members.length).fill(null)];
}

/**
 * 为尚未录入资料的设计卡位提供可交互的待补充详情，避免虚构成员信息。
 * @param group 卡片所属分组。
 * @param index 卡片在分组内的序号。
 * @returns 可供统一详情弹窗展示的占位成员。
 */
function getPlaceholderMember(group: TeamGroupDefinition, index: number): TeamMember {
  return {
    id: `${group.id}-placeholder-${index + 1}`,
    name: 'Member name',
    role: group.title,
    group: group.id,
    bio: 'Member details will be added after the team information has been confirmed.',
  };
}

/**
 * 按 Figma Team 画板展示成员分组，并实现画板注释指定的滚动高亮和详情卡。
 * @returns Members 页面。
 */
export function TeamPage() {
  useDocumentTitle('Members');
  const activeSection = useActiveSection(sectionIds);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedMember && !dialog.open) dialog.showModal();
    if (!selectedMember && dialog.open) dialog.close();
  }, [selectedMember]);

  return (
    <main className="team-page" id="main-content" tabIndex={-1}>
      <header className="team-page__hero">
        <h1>Our Team</h1>
        <div className="team-page__group-photo" role="img" aria-label="团队合照预留区域">
          <span>Group photo</span>
        </div>
      </header>

      <div className="team-page__shell">
        <aside className="team-page__aside" aria-label="Members sections">
          <a
            className={
              activeSection === 'primary-pis' || activeSection === 'secondary-pis'
                ? 'team-page__aside-link--active'
                : undefined
            }
            href="#primary-pis"
          >
            Team PIs
          </a>
          <a
            className={
              activeSection === 'student-leaders' ? 'team-page__aside-link--active' : undefined
            }
            href="#student-leaders"
          >
            Student Leaders
          </a>
          <a
            className={
              activeSection === 'student-members' ? 'team-page__aside-link--active' : undefined
            }
            href="#student-members"
          >
            Student Team Members
          </a>
        </aside>

        <div className="team-page__groups">
          {teamGroups.map((group) => (
            <section className="team-group" id={group.id} key={group.id}>
              <h2>
                {group.eyebrow ? <span>{group.eyebrow}</span> : null}
                <strong>{group.title}</strong>
              </h2>
              <div className="team-group__grid">
                {getGroupSlots(group).map((member, index) =>
                  member ? (
                    <button
                      className="team-member-card"
                      type="button"
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      aria-label={`View details for ${member.name}`}
                    >
                      <span className="team-member-card__portrait">
                        {member.portraitUrl ? <img src={member.portraitUrl} alt="" /> : null}
                      </span>
                      <img className="team-member-card__divider" src={memberDividerUrl} alt="" />
                      <strong>{member.name}</strong>
                    </button>
                  ) : (
                    <button
                      className="team-member-card team-member-card--placeholder"
                      type="button"
                      key={`${group.id}-${index}`}
                      onClick={() => setSelectedMember(getPlaceholderMember(group, index))}
                      aria-label={`View details for ${group.title} member ${index + 1}`}
                    >
                      <span className="team-member-card__portrait" aria-hidden="true" />
                      <img className="team-member-card__divider" src={memberDividerUrl} alt="" />
                      <strong>Member name</strong>
                    </button>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      <dialog
        className="team-member-dialog"
        ref={dialogRef}
        onClose={() => setSelectedMember(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedMember(null);
        }}
      >
        {selectedMember ? (
          <article>
            <button
              className="team-member-dialog__close"
              type="button"
              aria-label="Close member details"
              onClick={() => setSelectedMember(null)}
            >
              ×
            </button>
            <h2>{selectedMember.name}</h2>
            <img src={detailDividerUrl} alt="" />
            <p>{selectedMember.bio}</p>
          </article>
        ) : null}
      </dialog>
    </main>
  );
}
