import { component$, useStylesScoped$ } from '@builder.io/qwik';

import styles from './movement.scss?inline';

export const Movement = component$(() => {
  useStylesScoped$(styles);

  return <>Movement works!</>;
});
