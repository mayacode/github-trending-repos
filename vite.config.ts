import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    coverage: {
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/*.config.{js,ts}',
        '**/tsconfig*.json',
        '**/package.json',
        '**/yarn.lock',
        '**/tests/**',
        '**/scripts/**',
        '**/public/**',
        '**/index.html',
        '**/*.d.ts',
        '**/vite-env.d.ts',
        '**/main.tsx',
      ],
    },
  },
} as UserConfig);
