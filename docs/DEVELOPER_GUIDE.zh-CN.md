# 新手开发者指南

## 1. 环境准备

- Node.js：推荐 **22 LTS**，最低 `22.12.0`。用 `node --version` 检查。
- Yarn：项目锁定 Yarn Classic `1.22.22`。先运行 `corepack enable`，再用 `yarn --version` 检查。
- Git：使用团队官方 `https://gitlab.igem.org/2026/<team-slug>` 仓库。
- 编辑器：推荐 VS Code，并安装 ESLint、Prettier 插件。

```bash
git clone https://gitlab.igem.org/2026/<team-slug>.git
cd <team-slug>
cp .env.example .env
yarn install
yarn dev
```

打开终端显示的本地地址。开发结束前运行 `yarn run check`；该命令依次检查 ESLint、Prettier、TypeScript 和生产构建。注意 Yarn Classic 自带一个不同用途的 `yarn check`，因此这里必须带 `run`。

## 2. 完整目录结构与职责

```text
igem-2026-wiki/
├── .env.example                 # 团队 slug、名称、年份和可选 API 配置模板
├── .gitignore                   # Git 忽略规则
├── .gitlab-ci.yml               # 官方 GitLab Pages 构建和部署管线
├── .prettierignore              # Prettier 忽略项
├── .prettierrc.json             # 统一格式配置
├── eslint.config.js             # TypeScript、Hooks、JSDoc 质量规则
├── index.html                   # React 唯一 HTML 入口；保留官方工具栏注入空间
├── LICENSE                      # 源代码 MIT 许可证
├── package.json                 # 依赖、Node/Yarn 约束和脚本
├── README.md                    # 项目入口说明
├── tsconfig.json                # TypeScript 项目引用入口
├── tsconfig.app.json            # 浏览器/React TypeScript 配置
├── tsconfig.node.json           # Vite/ESLint 配置文件的 TS 配置
├── vite.config.ts               # `/<team-slug>/` 生产基路径与构建配置
├── public/                      # 原样复制文件；避免放正式 iGEM 大型资源
├── docs/
│   ├── DEVELOPER_GUIDE.zh-CN.md # 本指南
│   ├── AI_CONTEXT_GUIDE.zh-CN.md# 后续 AI 的架构与修改约束
│   └── IGEM_2026_RULES.zh-CN.md # 官方规范、来源与核验状态
└── src/
    ├── main.tsx                 # React、Router、Provider 挂载入口
    ├── App.tsx                  # 全局布局和路由组合
    ├── vite-env.d.ts            # Vite 环境变量类型
    ├── components/
    │   ├── common/              # Card、Badge、Callout、表格、统计、折叠等通用 UI
    │   ├── layout/              # Header、Footer、Container、PageLayout
    │   └── navigation/          # 面包屑、页内目录、上一页/下一页
    ├── data/                    # 纯模拟数据；不含 JSX 和请求逻辑
    ├── hooks/                   # 滚动、章节追踪、开关、异步、表单等独立逻辑
    ├── pages/                   # 路由页面；以内容组合为主
    ├── routes/                  # 路由元数据唯一来源
    ├── state/                   # Context + useReducer 全局状态
    ├── styles/
    │   ├── theme.css            # 所有颜色、字体、间距、圆角变量
    │   └── components.css       # BEM 类名与最低限度结构规则
    ├── types/                   # 跨模块 TypeScript 数据契约
    └── utils/                   # 无 React 依赖的纯函数
```

## 3. 架构规则

- 页面只组合组件和 Hook，不直接监听 `window`、手写请求状态机或操作 DOM。
- `data/navigation.ts` 是导航、页面搜索和前后页关系的唯一元数据源；`routeDefinitions.ts` 只负责把路径装配到页面组件。
- 跨页面共享且确有需要的 UI 状态放 `AppContext`；单页面输入使用本地 Hook。不要把所有状态塞进全局。
- 可复用 UI 接收数据和回调，不导入具体页面数据。
- 所有函数、组件、复杂逻辑必须有详细中文 JSDoc；参数写 `@param`，返回值写 `@returns`，副作用和注意事项写在正文。
- JSX 使用 BEM 类名：`block`、`block__element`、`block--modifier`。
- JSX 不能写 `style={{...}}`；品牌视觉只能通过 CSS 变量和 BEM 样式表达。

## 4. 如何新增页面

1. 在 `src/pages/` 新建 `SafetyPage.tsx`。
2. 用 `PageLayout` 包装内容，并为组件写中文 JSDoc。
3. 在 `src/data/navigation.ts` 新增页面元数据：

```tsx
{
  path: '/safety',
  label: '安全',
  title: '安全',
  description: '风险识别、缓解与合规记录。',
  group: 'Project',
}
```

4. 在 `src/routes/routeDefinitions.ts` 导入组件，并把路径加入 `componentByPath`。

导航、搜索、面包屑和前后页会自动更新。如果页面不应在导航显示，设置 `showInNavigation: false`。路径只写 Router 内部路径，不加团队 slug。页面应向 `PageLayout` 传入 `{ id, label }[]` 的 `sections`，并确保对应 `<section id>` 存在。

## 5. 如何新增组件

1. 判断是全局复用组件（`components/common`）、布局组件（`components/layout`）还是页面私有片段。
2. Props 用 TypeScript `interface` 描述；组件通过 Props 接收数据和事件。
3. 不在组件内读取具体模拟数据，不假设父级 DOM，不用 `querySelector`。
4. 挂载 BEM 类名，将样式写入 `components.css`，视觉值引用 `theme.css` 变量。
5. 为组件与内部处理函数写中文 JSDoc，并运行 `yarn run check`。

## 6. 修改模拟数据或调用接口

模拟成员和时间线分别位于 `src/data/team.ts` 与 `src/data/timeline.ts`。保持对象字段符合 `src/types/content.ts`，页面会自动渲染。

静态 Wiki 的评审核心内容不应依赖在线 API。确需调用团队控制的 HTTPS API 时：

```tsx
/** 从受控接口读取成员，并在非 2xx 响应时抛出错误。 */
const loadMembers = async (): Promise<TeamMember[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members`);
  if (!response.ok) throw new Error(`请求失败：${response.status}`);
  return response.json() as Promise<TeamMember[]>;
};
```

把函数交给 `useAsyncData`，并保留 Loading、Error、Empty、Success 四种展示。必须提供静态降级内容；不得在前端环境变量存密钥，因为 Vite 的 `VITE_*` 会进入公开构建产物。

联系表单当前只做本地验证、不发送内容。若接入后端，先确认隐私声明、跨域、反垃圾和 iGEM 外部服务规则。

## 7. 替换主题与美术协作

美术人员先改 `src/styles/theme.css`：

```css
:root {
  --color-ink: #123456;
  --color-paper: #ffffff;
  --color-accent: #dfff00;
  --font-body: 'Team Font', sans-serif;
  --space-3: 1rem;
  --radius-small: 0.25rem;
}
```

当前线框图组件包括 `Badge`、`Callout`、`Card`、`SectionHeading`、`StatGrid`、`DataTable`、`QuoteBlock`、`Accordion`、`AsyncStateView`、`Breadcrumbs`、`TableOfContents` 和 `PageNavigation`。新增页面应先复用这些组件；只有出现新的信息语义时才新增组件。

若变量不足，先在 `theme.css` 新增语义变量，再在 `components.css` 引用。禁止把颜色、字体、间距、圆角写进 JSX 或散落在组件样式中。自定义字体必须上传到 `static.igem.wiki`，用 `@font-face` 引用；禁止 Google Fonts。

## 8. 静态资源

开发期可用小型本地占位文件；生产资源必须经 [iGEM Uploads](https://teams.igem.org/go/deliverables/wiki/uploads) 上传。得到 URL 后写成 `https://static.igem.wiki/...`，同时补充准确 `alt`。视频使用 [iGEM Video Universe](https://video.igem.org/) 和当年官方嵌入方式，禁止 YouTube/Vimeo。

## 9. 部署到 iGEM GitLab Pages

1. 确认 `.env` 中 `VITE_TEAM_SLUG` 与官方仓库 slug 完全一致；CI 需要变量时，在 GitLab Settings → CI/CD → Variables 添加同名变量。不要提交秘密。
2. 在官方仓库创建分支并提交：`git add .`、`git commit`、`git push`。
3. 合并到默认分支后，`.gitlab-ci.yml` 使用 Node 22，执行 `yarn install --frozen-lockfile` 和 `yarn run check`。
4. Vite 输出 `dist/`；管线把它改名为 GitLab Pages 要求的 `public/` 并上传 artifact。
5. 在 GitLab Build → Pipelines 确认 `pages` job 成功。
6. 打开 `https://2026.igem.wiki/<team-slug>/`，再直接访问 `/description` 等深层链接。
7. 用浏览器 Network 面板检查：无 Google Fonts、CDN、外部图片/脚本请求；所有 iGEM 资源来自允许的官方域名。
8. 检查官方登录栏未被覆盖、页脚许可与源码链接每页可见、键盘导航可用。

如果深层 URL 直接访问返回 404，先核对 iGEM 官方 2026 模板的 Pages 管线与服务器回退配置，不要随意改成 HashRouter，因为 `#` 路由通常不符合 Wiki 稳定 URL 期望。

## 10. 常见问题

- **资源本地正常、线上 404**：通常是硬编码根路径或 team slug 错误。使用导入、`Link` 与 `import.meta.env.BASE_URL`。
- **Yarn 锁文件报错**：在 Node 22 + Yarn 1.22.22 下运行 `yarn install`，提交生成的 `yarn.lock`。
- **ESLint 报缺少注释**：为函数、组件、箭头回调补中文 JSDoc。简单的 `map` 内联回调由配置也会检查时，可抽成具名函数或按实际规则调整，但不能删除整体注释要求。
- **美术想改 DOM**：业务逻辑应先抽到 Hook；保留 Props 契约和 BEM 类名即可自由重排语义标签。
- **规则是否一定完整**：以 `docs/IGEM_2026_RULES.zh-CN.md` 的核验日期为准，并在 Wiki Freeze 前重新核对官方页面。
