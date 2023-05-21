import { component$, useStylesScoped$ } from '@builder.io/qwik';

import styles from './reports-svg.scss?inline';

export const ReportsSvg = component$(() => {
  useStylesScoped$(styles);

  return <>ReportsSvg works!</>;
});
