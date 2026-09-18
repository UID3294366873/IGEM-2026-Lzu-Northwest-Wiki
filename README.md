# 2026 iGEM React Wiki 基础架构

这是一个采用高对比线框图视觉的 React + TypeScript + Vite 静态 Wiki。它参考 McGill 2025 和 iGEM 官方 2026 React/Vite 模板的部署方式，将数据、状态、Hook、页面与视觉接口明确分层；无外部字体、图片、CDN 或 UI 组件库。

## 快速开始

```bash
cp .env.example .env
yarn install
yarn dev
```

提交前运行：

```bash
yarn run check
```

详细说明见：

- [新手开发者指南](docs/DEVELOPER_GUIDE.zh-CN.md)
- [AI 辅助开发上下文指南](docs/AI_CONTEXT_GUIDE.zh-CN.md)
- [2026 iGEM Wiki 官方规范核验记录](docs/IGEM_2026_RULES.zh-CN.md)

## 上线前必须修改

1. 复制 `.env.example` 为 `.env`，将 `VITE_TEAM_SLUG` 改为官方 GitLab 项目 slug。
2. 修改团队名称并替换所有示例内容。
3. 通过官方 Uploads 上传图片、字体等资源，只使用其返回的 `static.igem.wiki` URL。
4. 更新页脚 GitLab 仓库地址，检查 CC BY 4.0 声明。
5. 对照当日官方 Wiki、Judging 和 Deliverables 页面做最终复核。

本仓库源码采用 MIT License；Wiki 内容示例采用 CC BY 4.0。
