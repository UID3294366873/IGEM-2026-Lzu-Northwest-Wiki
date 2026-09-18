import type { TimelineEvent } from '../types/content';

/** 模拟实验进度数据，可替换为 JSON 文件或受控 API 的返回值。 */
export const timelineEvents: TimelineEvent[] = [
  {
    id: 'event-1',
    date: '2026-03-12',
    title: '问题定义',
    description: '完成需求访谈并建立初始假设。',
  },
  {
    id: 'event-2',
    date: '2026-05-06',
    title: '设计周期一',
    description: '完成构建设计和第一轮风险评估。',
  },
  {
    id: 'event-3',
    date: '2026-07-18',
    title: '测试与学习',
    description: '记录模拟结果并调整关键参数。',
  },
  {
    id: 'event-4',
    date: '2026-09-02',
    title: '设计周期二',
    description: '整合反馈，准备可复现实验记录。',
  },
];
