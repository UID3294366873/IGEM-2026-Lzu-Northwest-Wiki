# 2026 iGEM Wiki 官方规范核验记录

> 核验日期：2026-09-04。iGEM 规则可能继续调整；Wiki Freeze 前必须重新打开官方页面逐项复核。本文区分“官方已确认”和“保守兼容策略”，不把历史惯例冒充 2026 新规。

## 一、官方已确认的 2026 信息

1. **官方地址与路径**：团队 Wiki 生产地址采用 `https://2026.igem.wiki/<team-slug>/`。官方 2026 项目和已迁移团队均采用该格式。Vite `base` 与 React Router `basename` 必须包含团队 slug，否则直接访问页面或加载构建资源会失败。
2. **源码与部署**：源码保存在 iGEM GitLab 的 2026 团队项目中，通过 GitLab Pages 管线发布。构建产物目录需要作为 `public` artifact 发布；本项目由 `dist` 改名为 `public`。
3. **资源托管**：图片、照片、图标和字体等 Wiki 资源必须通过 iGEM Uploads 上传并由 `static.igem.wiki` 提供。不要使用 Google Fonts、公共 CDN、外部图床或运行时从 GitHub 拉取资源。
4. **视频与音频**：视频应通过 iGEM Video Universe（`video.igem.org`）提供。2026 官方模板更新新增了 Video & Audio 指南入口。不要嵌入 YouTube、Vimeo 或其他第三方播放器。
5. **页脚信息**：每页必须包含内容许可声明，以及指向团队 `gitlab.igem.org` 源码仓库的链接。官方模板使用 CC BY 4.0 作为 Wiki 内容许可。
6. **官方平台 UI**：生产平台会提供官方登录/工具栏。团队代码不得隐藏、覆盖、仿冒或替换它；也不要用全屏固定层遮挡其交互区域。
7. **截止时间**：2026 Wiki Freeze 为 **2026-10-21 15:00 UTC**；Thaw 为 **2026-11-25 15:00 UTC**；最终归档为 **2026-12-09 15:00 UTC**。以官方日历的最新显示为准。
8. **奖项术语变化**：2026 官方模板将 `Prize` 更新为 `Award`，Judging 链接更新到 `/judging/awards/...`；Best Software Tool 更新为 Best Software，并调整了资格说明。页面内容应按 2026 Judging Handbook 和 Award 页面逐项编写。

## 二、禁止项与保守兼容边界

以下策略覆盖官方限制，也避免评审网络环境下的隐私、可用性和归档风险：

- 不加载任何第三方 JavaScript、CSS、字体、分析器、聊天组件、地图 SDK 或 CDN 包。npm 依赖必须在构建阶段打包，不能在浏览器运行时请求 CDN。
- 不使用通用 `iframe`。唯一可能需要的例外是官方 Video Universe 的官方嵌入代码；使用前仍需对照当年 Video & Audio 指南。禁止把任意网页、YouTube、Google Docs、Figma 等塞入 iframe。
- 不从任意外部 API 加载评审所需内容。必须离线可用的核心材料应编译进站点；若确需 API，提供 Loading、Error、Empty 与静态降级内容，并核查当年政策。
- 不使用登录墙、Cookie 强依赖、付费服务或需跨域权限才能看到的证据。
- 不篡改 iGEM 注入的顶部工具栏；避免过高 `z-index`、全页面固定定位和全局 CSS 选择器污染。
- 不使用根路径硬编码（例如 `<a href="/team">`）。内部导航使用 React Router `Link/NavLink`；构建资源使用 Vite 导入或 `import.meta.env.BASE_URL`。
- 不把大文件直接提交到源码仓库代替 Uploads；先上传后替换为 `https://static.igem.wiki/...`。
- 不将秘密、令牌、受访者个人信息或未获同意的照片提交到公开仓库。

## 三、页面与内容最低检查

技术合规不等于满足奖项或 Medal 要求。最终页面集合由团队赛道、Village、Medal 与自提名 Award 决定，需从 2026 Judging Handbook 反推页面和证据。至少检查：

- Description、Engineering/Design、Experiments/Notebook、Results、Contribution、Attributions、Safety、Human Practices、Team 等适用内容是否完整；
- 所有外部贡献、顾问、机构和 AI 辅助是否准确归因；
- 部件、软件、模型、数据、协议和引用是否有稳定链接及复现说明；
- 图片有替代文本，表格有标题，标题层级连续，键盘可操作，文字对比度合格；
- 404、深层 URL、移动端、慢网与禁用第三方 Cookie 情况均可读；
- 页面无外部资源请求、无控制台错误、无损坏链接。

## 四、官方与一手来源

- [iGEM 2026 Deliverable Guides](https://competition.igem.org/deliverables/guides)
- [iGEM 2026 Competition Calendar](https://competition.igem.org/about/calendar)
- [iGEM 官方 Wiki React/Vite 模板](https://gitlab.igem.org/templates/wiki-react-vite)
- [官方模板 2026 release 合并记录](https://gitlab.igem.org/templates/wiki-react-vite/-/merge_requests/8)
- [iGEM Wiki Uploads 入口](https://teams.igem.org/go/deliverables/wiki/uploads)
- [iGEM Wiki Video & Audio 指南入口](https://teams.igem.org/go/deliverables/wiki/videos-and-audios)
- [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)

由于 `teams.igem.org/go/...` 是登录态动态入口，自动抓取可能返回空壳或重定向；2026-09-04 的核验同时参考了官方模板 2026 release 的提交说明。最终提交前应由已登录的团队成员人工复核这两个入口。
