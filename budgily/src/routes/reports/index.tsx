import {
  $,
  Resource,
  component$,
  noSerialize,
  useContext,
  useId,
  useResource$,
  useSignal,
  useStore,
  useStyles$,
  useVisibleTask$,
} from '@builder.io/qwik';

import {
  Category,
  ClientContextType,
  Movement,
  MovementType,
  filterValueNoCategory,
  getDskReportsV2,
} from '@codedoc1/budgily-data-client';
import { group, max } from 'd3';

import { ClientContext } from '../../core/client.context';
import { debounce } from '../../core/debounce';

import { MovementFilter } from '../../components/movement-filter/movement-filter';
import { ReportsLanding } from '../../components/reports-landing/reports-landing';

import { CategoriesFetcher } from '../../components/categories-fetcher/categories-fetcher';
import { MovementDetails } from '../../components/movement-details/movement-details';
import { AppStore } from '../../core/app.store';
import global from './index.scss?inline';
import { MovementsGrid } from 'budgily/src/components/movements-grid/movements-grid';
import { debouncedGetAllMovements, mapToViewModel } from 'budgily/src/core/movements.fetch';

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
      fromDate: new Date(2022, 8, 1),
    },
  });
  const view = useSignal<'chart' | 'grid'>('chart');

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
      <button class="btn btn-sm" onClick$={() => view.value = 'chart'}>Chart</button>
      <button class="btn btn-sm" onClick$={() => view.value = 'grid'}>Table</button>
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
