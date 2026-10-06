/** Team 画板中的成员分组。 */
export type TeamGroupId =
  'primary-pis' | 'secondary-pis' | 'student-leaders' | 'student-members' | 'instructors';

/** Word 中成员头像的显示与裁剪参数。 */
export interface TeamPortraitLayout {
  widthEmu: number;
  heightEmu: number;
  crop: { l: number; t: number; r: number; b: number };
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

/** 团队成员展示数据。 */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  group: TeamGroupId;
  portraitUrl?: string;
  portraitLayout?: TeamPortraitLayout;
}

/** 项目时间线事件。 */
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

/** 通用联系表单字段。 */
export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

/** 表单字段名到错误提示的映射。 */
export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;
