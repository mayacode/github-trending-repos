import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'default',
        ref: true,
        svgo: true,
        titleProp: true,
      },
      include: '**/*.svg?react',
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@helpers': path.resolve(__dirname, './src/helpers'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@types': path.resolve(__dirname, './src/types'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
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
