import type { TeamMember } from '../types/content';

/**
 * 模拟团队成员数据。图片上线后只能引用经 iGEM Uploads 上传并返回的
 * `static.igem.wiki` 地址，不应引用外部图床。
 */
export const teamMembers: TeamMember[] = [
  { id: 'member-1', name: '林晨', role: 'Team Leader', bio: '负责项目协作与工程周期管理。' },
  { id: 'member-2', name: '周宁', role: 'Wet Lab', bio: '负责实验设计、执行与记录复核。' },
  { id: 'member-3', name: '陈宇', role: 'Dry Lab', bio: '负责模型、数据分析与可复现脚本。' },
  { id: 'member-4', name: '苏禾', role: 'Human Practices', bio: '负责利益相关方访谈与反馈闭环。' },
];
