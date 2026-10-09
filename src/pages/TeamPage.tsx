import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { teamMembers } from '../data/team';
import { useActiveSection } from '../hooks/useActiveSection';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { TeamGroupId, TeamMember } from '../types/content';

interface TeamGroupDefinition {
  id: TeamGroupId;
  eyebrow: string;
  title: string;
}

const teamGroups: TeamGroupDefinition[] = [
  { id: 'primary-pis', eyebrow: 'Team PIs', title: 'PRIMARY PIs' },
  { id: 'secondary-pis', eyebrow: 'Team PIs', title: 'SECONDARY PIs' },
  { id: 'student-leaders', eyebrow: '', title: 'STUDENT LEADERS' },
  { id: 'student-members', eyebrow: '', title: 'STUDENT TEAM MEMBERS' },
  { id: 'instructors', eyebrow: '', title: 'INSTRUCTORS' },
];

const sectionIds = teamGroups.map((group) => group.id);
const memberDividerUrl = `${import.meta.env.BASE_URL}pages/team/images/decorations/member-divider.svg`;
const detailDividerUrl = `${import.meta.env.BASE_URL}pages/team/images/decorations/detail-divider.svg`;

/**
 * 把已核验成员放入对应分组，其余设计卡位保持匿名占位。
 * @param group 分组配置。
 * @returns 与 Figma 卡片数量一致的成员槽位。
 */
function getGroupMembers(group: TeamGroupDefinition): TeamMember[] {
  return teamMembers.filter((member) => member.group === group.id);
}

/**
 * 将 Word 的显示尺寸、裁剪和翻转信息转换为头像框内的 CSS。
 * @param member 团队成员数据。
 * @returns 图片裁剪层和原图样式。
 */
function getPortraitStyles(member: TeamMember): {
  frame: CSSProperties;
  image: CSSProperties;
} {
  const layout = member.portraitLayout;
  if (!layout) return { frame: {}, image: {} };
  const { l, t, r, b } = layout.crop;
  const visibleWidth = Math.max(1, 100000 - l - r);
  const visibleHeight = Math.max(1, 100000 - t - b);
  const flipX = layout.flipHorizontal ? -1 : 1;
  const flipY = layout.flipVertical ? -1 : 1;
  return {
    frame: { aspectRatio: `${layout.widthEmu} / ${layout.heightEmu}` },
    image: {
      width: `${(100000 / visibleWidth) * 100}%`,
      height: `${(100000 / visibleHeight) * 100}%`,
      left: `${(-l / visibleWidth) * 100}%`,
      top: `${(-t / visibleHeight) * 100}%`,
      transform: `rotate(${layout.rotation / 60000}deg) scale(${flipX}, ${flipY})`,
    },
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
          <a
            className={
              activeSection === 'instructors' ? 'team-page__aside-link--active' : undefined
            }
            href="#instructors"
          >
            Instructors
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
                {getGroupMembers(group).map((member) => {
                  const portraitStyles = getPortraitStyles(member);
                  return (
                    <button
                      className="team-member-card"
                      type="button"
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      aria-label={`View details for ${member.name}`}
                    >
                      <span className="team-member-card__portrait">
                        {member.portraitUrl ? (
                          <span
                            className="team-member-card__portrait-frame"
                            style={portraitStyles.frame}
                          >
                            <img
                              src={`${import.meta.env.BASE_URL}${member.portraitUrl}`}
                              alt={`Portrait of ${member.name}`}
                              style={portraitStyles.image}
                            />
                          </span>
                        ) : null}
                      </span>
                      <img className="team-member-card__divider" src={memberDividerUrl} alt="" />
                      <strong>{member.name}</strong>
                    </button>
                  );
                })}
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
            {selectedMember.bio.split('\n\n').map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ) : null}
      </dialog>
    </main>
  );
}
