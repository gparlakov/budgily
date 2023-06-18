import { component$, useStylesScoped$ } from '@builder.io/qwik';

import styles from './movements-grid.scss?inline';

export const MovementsGrid = component$(() => {
  useStylesScoped$(styles);

  return <>MovementsGrid works!</>;
});
