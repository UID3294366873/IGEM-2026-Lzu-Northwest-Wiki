import type { TeamMember } from '../types/content';

/**
 * 经团队成员本人核对后再填写。不得用虚构姓名或职责占位。
 * 成员照片必须使用 iGEM Uploads 返回的 `static.igem.wiki` 地址。
 */
export const teamMembers: TeamMember[] = [
  {
    id: 'baoping-zhang',
    name: 'Baoping Zhang',
    role: 'Primary PI',
    group: 'primary-pis',
    bio: 'Zhang Baoping is an associate professor and attending physician at the School of Stomatology. They hold a PhD and are affiliated with the Department of Oral and Maxillofacial Surgery.',
  },
];
