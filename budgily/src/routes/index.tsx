import {
  $,
  Resource,
  component$,
  noSerialize,
  useResource$,
  useSignal,
  useStore,
  useStyles$,
  useVisibleTask$
} from '@builder.io/qwik';
import { type DocumentHead } from "@builder.io/qwik-city";

import { filterValueNoCategory } from '@codedoc1/budgily-data-client';

import { MovementFilter } from '../components/movement-filter/movement-filter';
import { ReportsLanding } from '../components/reports-landing/reports-landing';

import { MovementsGrid } from 'budgily/src/components/movements-grid/movements-grid';
import { mapToViewModel } from 'budgily/src/core/movements.fetch';
import { CategoriesFetcher } from '../components/categories-fetcher/categories-fetcher';
import { MovementDetails } from '../components/movement-details/movement-details';
import { AppStore } from '../core/app.store';
import { debouncedGetAllMovements } from '../core/data/get-data';

import global from './index.scss?inline';


export default component$(() => {
  useStyles$(global);
  const appStore = useStore<AppStore>({
    movements: noSerialize([]),
    maxSum: 0,
    months: [],
    allCategories: noSerialize([]),
    filter: {
      categories: [],
    },
  });

  const view = useTabStorage<View>('chart');


  const vm = useResource$(async ({ track, cleanup }) => {
    track(appStore.filter);
    const abort = new AbortController();
    cleanup(() => abort.abort());

    return debouncedGetAllMovements(appStore.filter, { field: 'date', desc: true })
      .then(mapToViewModel)
      .then(({ errors, maxSum, months, movements }) => {
        appStore.movements = noSerialize(movements);
        appStore.maxSum = maxSum;
        appStore.months = months;
        return { errors };
      });
  });

  const toggle$ = $((to: 'next' | 'previous') => {
    if (appStore.movements && appStore.selectedId) {
      const i = appStore.movements.findIndex((v) => v.id === appStore.selectedId);
      let next = to === 'next' ? i + 1 : i - 1;

      if (next >= appStore.movements.length - 1) {
        next = 0;
      } else if (next <= 0) {
        next = appStore.movements.length - 1;
      }
      appStore.selectedId = appStore.movements[next].id;
    }
  });

  // when on client - initiate the fetch for all categories
  useVisibleTask$(() => {
    appStore.filter.categories = [filterValueNoCategory];

    appStore.next = noSerialize(() => {
      toggle$('next');
    })

    appStore.previous = noSerialize(() => toggle$('previous'));
  });

  return (
    <>
      <CategoriesFetcher store={appStore}></CategoriesFetcher>
      <header class="navbar">
        <div class="navbar-start">
          <div class="join">

            <button class={`join-item  hide-text  btn btn-sm ${view.value === 'chart' ? 'btn-accent ' : ''}`} onClick$={() => view.value = 'chart'}>📊 <span class="hidden-text">chart</span></button>
            <button class={`join-item  hide-text btn btn-sm ${view.value === 'grid' ? 'btn-accent' : ''}`} onClick$={() => view.value = 'grid'}>📑 <span class="hidden-text">grid</span></button>
            <button class="join-item hide-text  btn btn-sm" onClick$={() => (appStore.filter.categories = [...appStore.filter.categories])} title="reload"> 🔁 <span class="hidden-text">reload</span></button>
          </div>
        </div>

        <div class="navbar-center">
          <MovementFilter filterStore={appStore}></MovementFilter>
        </div>

      </header>

      {view.value === 'chart' ?
        <Resource
          value={vm}
          onResolved={({ errors }) => {
            return Array.isArray(errors)
              ? <>{errors.map((e, i) => <span key={`error-index-key-${i}`}>{JSON.stringify(e)}</span>)}</>
              : <>
                <ReportsLanding movementDetailsStore={appStore}></ReportsLanding>
                <MovementDetails store={appStore}></MovementDetails>
              </>
          }
          }
          onPending={() => <>Loading...</>}
          onRejected={(e) => (
            <>
              Could not load movements. Error follows (if any): <hr /> {JSON.stringify(e)}
            </>
          )}
        ></Resource>
        : <MovementsGrid appStore={appStore}></MovementsGrid>}
    </>
  );
});

type View = 'chart' | 'grid';

function useTabStorage<T extends string>(def: T) {
  const key = 'budgilyMovementsView';
  const view = useSignal<T>(def);
  // initialize on client
  useVisibleTask$(() => {
    view.value = (sessionStorage?.getItem(key) ?? def) as T;
  });

  // on change
  useVisibleTask$(({ track }) => {
    track(view);

    const val = view.value ?? def;
    sessionStorage?.setItem(key, val);
  });

  return view;
}


export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
