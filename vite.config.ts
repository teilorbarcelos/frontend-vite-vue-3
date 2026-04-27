import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    pool: 'threads',
    maxWorkers: 1, // not change this
    css: false,
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90
      },
      exclude: [
        'src/test/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.test.vue',
        'dist/**',
        'node_modules/**',
        'src/components/ui/*/index.ts',
        'src/components/ui/DataTable/types.ts'
      ]
    }
  }
});
