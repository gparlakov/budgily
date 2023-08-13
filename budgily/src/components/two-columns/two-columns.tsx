import { Slot, component$, useStylesScoped$ } from '@builder.io/qwik';

import styles from './two-columns.scss?inline';

export const TwoColumns = component$(() => {
  useStylesScoped$(styles);

  return <>
    <div class="wrap">
      <article class="left">

        <h2 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
        ><Slot name="left-title" /></h2>
        <p class="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400"
        >
          <Slot name="left-description" />
        </p>
        <Slot name="left-action" />

      </article>
      <div class="right">
        <Slot name="right" />
      </div>
    </div>
  </>;
});
