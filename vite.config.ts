import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/**
 * 将团队名称转为 iGEM URL 使用的小写 slug。
 * @param value 原始团队标识。
 * @returns 仅含小写字母、数字和连字符的路径片段。
 */
function normalizeTeamSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * 生成 Vite 配置。生产环境使用 `/<team-slug>/`，开发环境使用根路径，既匹配
 * `https://2026.igem.wiki/<team-slug>/`，又避免本地开发必须手输前缀。
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const slug = normalizeTeamSlug(env.VITE_TEAM_SLUG || 'lzu-northwest');
  return {
    base: mode === 'production' ? `/${slug}/` : '/',
    publicDir: false,
    plugins: [react()],
    build: { outDir: 'dist', sourcemap: false },
  };
});
