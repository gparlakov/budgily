import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { qwikNxVite } from 'qwik-nx/plugins';
import viteEslint from 'vite-plugin-eslint';

export default defineConfig({
  cacheDir: '../node_modules/.vite/./budgily',
  plugins: [
    qwikNxVite({}),
    qwikCity({}),
    qwikVite({
      devTools: {
        clickToSource: false,
      },
      client: {
        outDir: './dist/./client',
      },
      ssr: {
        outDir: './dist/./server',
      },
    }),
    tsconfigPaths({ root: '../' }),
    viteEslint({ lintOnStart: false, overrideConfigFile: './.eslintrc.json' }),
  ],
  server: {
    fs: {
      // Allow serving files from the project root
      allow: ['../'],
    },
  },
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=600',
    },
  },
  test: {
    globals: true,
    cache: {
      dir: '../node_modules/.vitest',
    },
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  assetsInclude: ['**/*.xml', '**/*.csv'],
});
