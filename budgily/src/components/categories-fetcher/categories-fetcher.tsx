import { NoSerialize, Resource, component$, noSerialize, useResource$, useSignal, useStylesScoped$, useTask$, useVisibleTask$ } from '@builder.io/qwik';

import styles from './categories-fetcher.scss?inline';

import { CategoryVM } from 'budgily/src/core/movement.types';
import { getCategoriesFromLocalStorageOrEmpty } from '@codedoc1/budgily-data-client';

export interface CategoriesFetcherProps {
  store: {
    allCategories: NoSerialize<CategoryVM[]>
  }
}

export const CategoriesFetcher = component$(({ store }: CategoriesFetcherProps) => {
  useStylesScoped$(styles);

  const retry = useSignal<number>(-1)

  const categories = useResource$(({ cleanup, track }) => {
    track(retry);
    const abort = new AbortController();
    cleanup(() => abort.abort());
    return getCategoriesFromLocalStorageOrEmpty();
  });

  // on client init - initial "retry" i.e. init
  useVisibleTask$(() => { retry.value = 0; });

  return <Resource value={categories} onResolved={(cs) => {
    if (Array.isArray(cs)) {
      store.allCategories = noSerialize(cs);
    } else if (retry.value === 0) {
      retry.value++;
    }
    return <></>
  }}

    onRejected={(e) => {
      if (retry.value === 0) {
        retry.value++;
        return <></>
      } else {
        return <><button onClick$={() => {
          retry.value++;
        }}>Retry fetch categories</button>|<span title={JSON.stringify(e)}>Could not fetch categories (hover to see error)</span></>
      }
    }} />;
});
