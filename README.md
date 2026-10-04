# LZU-Northwest 2026 iGEM Wiki

这是 LZU-Northwest 的 React + TypeScript + Vite 静态 Wiki。项目主题为 **Sybio-Gutweaver**：面向放疗相关急性肠损伤的工程化口服活菌候选方案。

## 团队名称与 slug

`slug` 是名称在 URL 和仓库路径中的标准化形式，通常只包含小写字母、数字和连字符：

- 团队显示名称：`LZU-Northwest`
- 团队 slug：`lzu-northwest`
- 官方 Wiki：`https://2026.igem.wiki/lzu-northwest/`
- 官方 GitLab：`https://gitlab.igem.org/2026/lzu-northwest`

项目默认值和官方 CI 已配置为上述名称。最终仍应以 iGEM 实际分配的 GitLab 项目路径为准。

## 本地开发

```bash
yarn install --frozen-lockfile
yarn dev
```

提交前运行：

```bash
yarn check
```

## 官方构建与部署

`.gitlab-ci.yml` 在默认分支上执行：

1. 使用锁文件安装依赖；
2. 执行 ESLint 和 Prettier 检查；
3. 构建静态网站；
4. 确认产物小于 5 MB；
5. 将 `dist` 发布为 GitLab Pages artifact。

不要提交 `dist`、预编译压缩包或 CloudBase 部署产物。

## 科研诚信

- 不发布模拟实验、虚构成员、虚构访谈引语、生成式实验图片或不存在的引用。
- 成员、实验时间线、项目数字和访谈摘要必须由负责人核验。
- Wiki 内容采用 CC BY 4.0；第三方素材必须具有兼容许可并正确归因。
- AI 辅助写作、代码和装饰性图片需按 iGEM 2026 要求披露。

更多项目说明见：

- [新手开发者指南](docs/DEVELOPER_GUIDE.zh-CN.md)
- [AI 辅助开发上下文指南](docs/AI_CONTEXT_GUIDE.zh-CN.md)
- [2026 iGEM Wiki 官方规范核验记录](docs/IGEM_2026_RULES.zh-CN.md)
