import type { TeamMember } from '../types/content';
import teamMemberData from './teamMembers.json';

/**
 * 经团队成员本人核对后再填写。不得用虚构姓名或职责占位。
 * 成员照片必须使用 iGEM Uploads 返回的 `static.igem.wiki` 地址。
 */
export const teamMembers = teamMemberData as TeamMember[];
