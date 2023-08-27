import { staticAdapter } from '@builder.io/qwik-city/adapters/static/vite';
import { extendConfig } from '@builder.io/qwik-city/vite';
import baseConfig from '../../vite.config';

const base = process.env.BUDGILY_BASE ?? '/';

export default extendConfig(baseConfig, () => {
  return {
    base,
    build: {
      ssr: true,
      rollupOptions: {
        input: ['@qwik-city-plan'],
      },
      outDit: './budgily'
    },
    plugins: [
      staticAdapter({
        base: `${base}/build/`,
        origin: 'https://gparlakov.github.io/',
        debug: true
      }),
    ],
  };
});

