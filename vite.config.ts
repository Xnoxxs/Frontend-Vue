/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { analyzer } from 'vite-bundle-analyzer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 5174,
  },
  plugins: [
    vue(),
    analyzer({
      enabled: mode === 'analyze',
      analyzerMode: 'static',
      fileName: 'bundle-report',
      openAnalyzer: true,
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/.next/**',
      '**/e2e/**',
    ],
  },
}))
