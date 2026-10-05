import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * 生成 CloudBase 静态托管配置。生产与开发环境均从站点根路径加载资源，
 * 并将 public 目录完整复制到构建输出中。
 */
export default defineConfig({
  base: '/',
  publicDir: 'public',
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false },
});
