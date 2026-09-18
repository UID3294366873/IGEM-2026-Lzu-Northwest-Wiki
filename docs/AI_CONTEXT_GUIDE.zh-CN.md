# AI 辅助开发上下文指南

> 将本文作为后续 AI 编程任务的系统上下文。开始修改前，AI 必须同时阅读 `README.md`、`docs/IGEM_2026_RULES.zh-CN.md` 和目标文件；规则有时效性时必须查官方一手来源。

## 1. 项目目标

本项目是 2026 iGEM 团队 Wiki 的 React 静态基础架构。首要目标依次为：iGEM 技术合规、内容长期可读、可访问性、逻辑与 DOM 解耦、新手可维护、美术可自由替换视觉。当前界面采用高对比线框图设计语言；保持其网格、边框、编号和证据优先的结构，不要擅自换成无关的装饰性风格。

## 2. 架构设计哲学

### 单一来源

`src/data/navigation.ts` 驱动导航、搜索、面包屑和前后页；`src/routes/routeDefinitions.ts` 仅装配页面组件。避免分别维护多份页面文案。`src/data` 是模拟内容来源，`src/types` 是跨层契约，`theme.css` 是视觉值唯一来源。

### 依赖方向

```text
types / utils / data
        ↓
      hooks       state
        ↓           ↓
 reusable components
        ↓
      pages
        ↓
 routes + App + main
```

下层不能反向导入页面。通用组件不能导入具体页面数据。Hook 返回状态与操作，不返回绑定特定标签层级的整块 JSX。

### 逻辑与 DOM 解耦

页面负责语义结构和内容组合；滚动监听、异步状态、表单校验、标题同步放在 Hook 或纯函数。禁止 `querySelector`、依赖子节点索引、按 CSS 类查找业务元素。美术重排 JSX 时，只要保留 Hook 调用、Props 和事件绑定，逻辑应继续工作。

### 最小状态原则

跨页面且需要保留的搜索词放 Context + `useReducer`。联系表单是页面私有状态，放 `useContactForm`。服务端数据由 `useAsyncData` 管理。不要引入 Redux/Zustand，除非出现多个独立领域、复杂跨页缓存或调试需求，并先记录 ADR。

## 3. 自定义 Hooks 清单

### `useAsyncData<T>(loader, isEmpty)`

- 输入：返回 `Promise<T>` 的稳定 `loader`；判断数据为空的稳定 `isEmpty`。
- 输出：`{ state, retry }`。
- `state` 是可辨识联合：`loading | success | empty | error`。Success/Empty 才有数据，Error 才有 `Error`。
- 注意：调用方应使用 `useCallback` 或模块级函数保持输入引用稳定，否则 Effect 会重复请求。核心评审内容必须有静态降级。

### `useContactForm()`

- 输入：无。
- 输出：`values`、`errors`、`submitted`、`handleChange`、`handleSubmit`。
- 验证规则在 `utils/formValidation.ts`，Hook 不依赖表单 DOM 层级。
- 当前不联网。若接入真实提交，必须补充异步提交状态、隐私与失败恢复。

### `useDocumentTitle(pageTitle)`

- 输入：页面标题字符串。
- 输出：无。
- 副作用：结合 `VITE_TEAM_NAME` 与 `VITE_TEAM_YEAR` 更新 `document.title`。

### `useScrollPosition(threshold = 240)`

- 输入：滚动阈值像素。
- 输出：是否超过阈值的布尔值。
- 副作用：注册 passive scroll listener，并在卸载时清理。组件不要重复注册监听器。

### `useDisclosure(initialOpen = false)`

- 输入：初始展开状态。
- 输出：`isOpen`、`open`、`close`、`toggle`。
- 用途：当前控制移动端导航；新增抽屉或说明面板时可复用，不要重新手写开关状态。

### `useActiveSection(sectionIds)`

- 输入：页面章节 id 数组。
- 输出：当前阅读章节 id。
- 副作用：通过 `IntersectionObserver` 观察章节并在卸载时断开；章节顺序或 JSX 可变，但 id 必须与 `PageLayout.sections` 一致。

## 4. 状态管理数据流（文字图）

```text
用户在 SearchPage 输入
  → handleSearch 派发 { type: "search/set", payload }
  → appReducer 生成新 AppState
  → AppContext Provider 广播
  → SearchPage 根据 state.searchQuery 过滤 routeMetadata
  → JSX 渲染匹配结果或 Empty 状态

数据页挂载
  → useAsyncData 调用 loader
  → loading
  → success / empty / error
  → 页面选择 AsyncStateView 或数据组件
  → 用户点重试 → retry → 再次进入 loading

联系表单输入
  → useContactForm 本地 values
  → submit → validateContactForm 纯函数
  → errors 或 submitted
  → 页面仅负责 aria 属性和展示位置
```

## 5. 修改代码的强制约束

1. **中文注释**：所有函数、组件和复杂逻辑块都要有中文 JSDoc。写明用途、`@param`、`@returns`、副作用、边界与注意事项；不能用“处理数据”这种无信息注释。
2. **样式**：禁止 JSX 内联 `style`。禁止在组件中硬编码颜色、字体、间距、阴影、圆角。先在 `theme.css` 创建语义变量，再由 `components.css` 的 BEM 选择器引用。
3. **BEM**：使用 `block__element--modifier`。不要把业务状态藏在脆弱的后代选择器或 `nth-child` 中。
4. **资源**：生产图片、图标、字体只用 iGEM Uploads 返回的 `static.igem.wiki` URL；视频只按当年 `video.igem.org` 指南。禁止 CDN、Google Fonts、外部图床、第三方分析脚本和任意 iframe。
5. **路由**：内部链接用 `Link/NavLink`；不要手动加 team slug，不要改用 HashRouter。生产 `base` 由 `vite.config.ts` 统一生成。
6. **官方 UI**：不隐藏、覆盖、替换 iGEM 登录/工具栏，不增加可能遮挡顶部的高层级固定元素。
7. **数据与密钥**：核心内容静态化。`VITE_*` 是公开值，绝不存令牌、密码或个人敏感信息。
8. **可访问性**：保留 skip link、语义标题、表单 label、aria-live、键盘操作和 reduced-motion；图片必须有准确 alt。
9. **组件边界**：通用组件通过 Props 接收数据；页面不能把事件监听与复杂验证写进 JSX；纯逻辑优先放 `utils`，有 React 生命周期才放 `hooks`。
10. **工作区安全**：`template/mcgill-main` 是只作比较的参考代码，不覆盖。实现目录是 `igem-2026-wiki`。保留用户无关改动。
11. **依赖**：新增运行时依赖前解释必要性、包体积、许可证与是否引发外部请求。优先使用平台能力和现有依赖。
12. **验证**：任何功能修改后至少执行 `yarn run check`；路由/部署修改还需用生产预览检查带 `/<team-slug>/` 的资源 URL。不要误用 Yarn Classic 自带的 `yarn check`。

## 6. 修改任务的标准流程

1. 阅读规则文档和相关类型、Hook、页面。
2. 判断规则是否可能在 2026 年变化；若是，搜索官方 `competition.igem.org`、`teams.igem.org` 或 `gitlab.igem.org` 一手来源。
3. 先修改类型/纯函数，再修改 Hook/状态，最后组合页面。
4. 添加详细中文 JSDoc 和可访问状态。
5. 视觉更改只增加或修改 CSS 变量与 BEM 规则。
6. 执行 `yarn run check`，审查构建产物中是否出现外部域名和错误根路径。
7. 向维护者说明变更、验证结果、仍需人工确认的 iGEM 动态规则。

## 7. 禁止的“便利性重构”

- 不把所有页面合并进 `App.tsx`。
- 不把模拟数据复制进 JSX。
- 不为单个页面引入全局状态。
- 不用 Bootstrap、Tailwind 或组件库覆盖当前无视觉基线，除非团队明确决定并完成资源合规审计。
- 不为了消除类型错误使用 `any`、`@ts-ignore` 或关闭 strict。
- 不删除 Loading/Error/Empty 分支。
- 不以历史 Wiki 经验替代 2026 官方规则；未确认事项必须注明“待人工复核”。

## 8. 完成定义

任务只有在以下条件同时满足时才完成：需求行为实现；类型和 lint 通过；Prettier 通过；生产构建成功；无新增外部运行时资源；深层路由和 team base 正确；中文 JSDoc 完整；文档与实现一致；任何未核验的官方细节已明确标注。
