import { extendConfig } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';

import baseConfig from '../../vite.config';

export default extendConfig(baseConfig, () => {
  return {
    plugins: [
      qwikVite({
        client: {
          outDir: './dist/./client/budgily',
        }
      }),
    ],
  };
});
