import {
  $,
  Resource,
  component$,
  noSerialize,
  useContext,
  useResource$,
  useServerData,
  useSignal,
  useStore,
  useStyles$,
  useVisibleTask$,
} from '@builder.io/qwik';

import {
  filterValueNoCategory
} from '@codedoc1/budgily-data-client';

import { ClientContext } from '../../core/client.context';

import { MovementFilter } from '../../components/movement-filter/movement-filter';
import { ReportsLanding } from '../../components/reports-landing/reports-landing';

import { MovementsGrid } from 'budgily/src/components/movements-grid/movements-grid';
import { debouncedGetAllMovements, mapToViewModel } from 'budgily/src/core/movements.fetch';
import { CategoriesFetcher } from '../../components/categories-fetcher/categories-fetcher';
import { MovementDetails } from '../../components/movement-details/movement-details';
import { AppStore } from '../../core/app.store';
import global from './index.scss?inline';


const debounceMovementMillis = 300;
export default component$(() => {
  useStyles$(global);
  const ctx = useContext(ClientContext);
  const appStore = useStore<AppStore>({
    movements: noSerialize([]),
    maxSum: 0,
    months: [],
    allCategories: noSerialize([]),
    filter: {
      categories: [],
      from: new Date(2022, 8, 1),
    },
  });

  const view = useTabStorage<View>('chart');


  const vm = useResource$(async ({ track, cleanup }) => {
    track(appStore.filter);
    const abort = new AbortController();
    cleanup(() => abort.abort());
    return debouncedGetAllMovements(
      ctx,
      abort,
      debounceMovementMillis
    )(appStore.filter)
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
      <MovementFilter filterStore={appStore}></MovementFilter>
      <button onClick$={() => (appStore.filter.categories = [...appStore.filter.categories])} title="reload"> 🔁</button>
      <button class={`btn btn-sm ${view.value === 'chart' ? 'btn-primary' : 'btn-accent'}`} onClick$={() => view.value ='chart'}>Chart</button>
      <button class={`btn btn-sm ${view.value === 'grid' ? 'btn-primary' : 'btn-accent'}`} onClick$={() => view.value = 'grid'}>Table</button>
      <Resource
        value={vm}
        onResolved={({ errors }) => (
          <>
            {view.value === 'chart' ? <ReportsLanding movementDetailsStore={appStore}></ReportsLanding> : <MovementsGrid appStore={appStore}></MovementsGrid>}
            {Array.isArray(errors) ? errors.map((e, i) => <span key={`error-index-key-${i}`}>{JSON.stringify(e)}</span>) : ''}{' '}
          </>
        )}
        onPending={() => <>Loading...</>}
        onRejected={(e) => (
          <>
            Could not load movements. Error follows (if any): <hr /> {JSON.stringify(e)}
          </>
        )}
      ></Resource>
      <MovementDetails store={appStore}></MovementDetails>
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
