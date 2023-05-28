import { NoSerialize, Resource, component$, noSerialize, useContext, useResource$, useSignal, useStylesScoped$, useTask$, useVisibleTask$ } from '@builder.io/qwik';

import styles from './categories-fetcher.scss?inline';
import { getCategories } from '@codedoc1/budgily-data-client';
import { ClientContext } from 'budgily/src/core/client.context';
import { CategoryVM } from 'budgily/src/core/movement.types';

export interface CategoriesFetcherProps {
  store: {
    allCategories: NoSerialize<CategoryVM[]>
  }
}

export const CategoriesFetcher = component$(({ store }: CategoriesFetcherProps) => {
  useStylesScoped$(styles);

  const retry = useSignal<number>(-1)

  const ctx = useContext(ClientContext);
  const categories = useResource$(({ cleanup, track }) => {
    track(retry);
    const abort = new AbortController();
    cleanup(() => abort.abort());
    return getCategories(ctx, abort)();
  });

  // on client init - initial "retry" i.e. init
  useVisibleTask$(() => { retry.value = 0; });

  return <Resource value={categories} onResolved={(cs) => {
    if (Array.isArray(cs.data?.categories)) {
      store.allCategories = noSerialize(cs.data?.categories.map(({id, name}) => ({id: id.toString(), name})) ?? []);
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
