import { staticAdapter } from '@builder.io/qwik-city/adapters/static/vite';
import { extendConfig } from '@builder.io/qwik-city/vite';
import baseConfig from '../../vite.config';

export default extendConfig(baseConfig, () => {
  return {
    base: '/budgily/',
    build: {
      ssr: true,
      rollupOptions: {
        input: ['@qwik-city-plan'],
      },
      outDit: './budgily'
    },
    plugins: [
      staticAdapter({
        base: '/budgily/build/',
        origin: 'https://gparlakov.github.io/',
        debug: true
      }),
    ],
  };
});

