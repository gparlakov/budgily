import { extendConfig } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';

import baseConfig from '../../vite.config';

const base = process.env.BUDGILY_BASE ?? '/';

export default extendConfig(baseConfig, () => {
  return {
    base,
    plugins: [
      qwikVite({
        client: {
          outDir: './dist/client',
        }
      }),
    ],
  };
});
