import { Resource, component$, noSerialize, useContext, useResource$, useStore, useStylesScoped$ } from '@builder.io/qwik';

import { ClientContextType } from '@codedoc1/budgily-data-client';
import { Pagination } from '@qwik-ui/tailwind';
import { AppStore } from 'budgily/src/core/app.store';
import { ClientContext } from 'budgily/src/core/client.context';
import { debouncedGetAllMovements } from 'budgily/src/core/movements.fetch';
import { Categorize } from '../categorize/categorize';
import { mapToVm } from '../movement-details/movement-details.types';
import styles from './movements-grid.scss?inline';

export const MovementsGrid = component$(({ appStore }: MovementsGridProps) => {
  useStylesScoped$(styles);
  const ctx = useContext(ClientContext);
  const grid = useStore<MovementsGrid>({ page: 1, size: 20, selected: useStore({ allSelected: false, selected: {} }), allIds: [], refresh: 1 })
  const movements = resourceMovementsPaginated(ctx, grid, appStore);
  const onCategorize = noSerialize(() => { grid.refresh += 1 })
  return <>
    <Resource value={movements} onResolved={(ms) => <>
      <Categorize store={appStore} onCategorize={onCategorize} />
      <div class="overflow-x-auto">
        <table class="table table-xs table-pin-rows">
          <thead>
            <tr>
              <th><input type="checkbox" checked={grid.selected.allSelected}
                onClick$={() => {
                  if (grid.selected.allSelected) {
                    grid.selected.allSelected = false;
                    grid.selected.selected = {}
                    appStore.selectedId = undefined;
                  } else {
                    grid.selected.allSelected = true;
                    grid.selected.selected = grid.allIds.reduce((acc, n) => ({ ...acc, [n]: true }), {});
                    appStore.selectedId = grid.allIds;
                  }
                }} />  <button class="" onClick$={() => navigator?.clipboard.writeText(Object.keys(grid.selected.selected).join(','))} title="Copy selected ids"><img src="/public/copy.svg" width="10" height="10" /></button> </th>
              <th>Amount</th>
              <th>Description</th>
              <th>Type</th>
              <th>Date</th>
              <th>Categories</th>
            </tr>
          </thead>
          <tbody>
            {ms.map(m => <tr key={m.id} class={m.type}>
              <th><input type="checkbox" value={m.id}
                checked={grid.selected.selected[m.id]}
                onClick$={() => {
                  grid.selected.selected[m.id] = !Boolean(grid.selected.selected[m.id])
                  appStore.selectedId = Object.keys(grid.selected.selected);
                }} /></th>
              <td>{m.type === 'credit' ? '+' : '-'} {m.amount}</td>
              <td>{m.description}</td>
              <td>{m.type}</td>
              <td>{m.date}</td>
              <td>{m.categories?.map(c => c.name).join(',')}</td>
            </tr>)}
          </tbody>
          <tfoot>
            <th></th>
            <td colSpan={5}>Total: {ms.reduce((acc, n) => n.type === 'debit' ? acc - n.amount : acc + n.amount, 0)}
            </td>
          </tfoot>
        </table>
      </div>
      <div class="w-2/12 inline-block" >
        <select onChange$={(_, b) => {
          const v = Number(b.value) > 0 ? Number(b.value) : 20;

          grid.size = v;
        }}>
          <option value="10" selected={grid.size === 10}>10</option>
          <option value="20" selected={grid.size === 20}>20</option>
          <option value="50" selected={grid.size === 50}>50</option>
          <option value="100" selected={grid.size === 100}>100</option></select>

        / {grid.totalCount}
      </div>
      <div class="w-10/12 inline-block"> <Pagination pages={grid.totalPages} page={grid.page} onPaging$={(page: number) => { if (page != grid.page) grid.page = page }} /></div>
    </>} />
  </>;
});

export interface MovementsGridProps {
  appStore: AppStore;
}

export interface MovementsGrid {
  allIds: string[];
  page: number;
  size: number;
  totalPages?: number;
  totalCount?: number;
  selected: { allSelected: boolean, selected: Record<string, boolean> };
  refresh: number;
}

function resourceMovementsPaginated(ctx: ClientContextType, grid: MovementsGrid, { filter }: MovementsGridProps['appStore']) {

  return useResource$(({ track, cleanup }) => {
    track(() => grid.page);
    track(() => grid.size);
    track(() => grid.refresh);
    track(filter)
    const abort = new AbortController();
    cleanup(() => abort.abort('cleanup'));
    const movementsFn = debouncedGetAllMovements(ctx, abort, 300)

    return movementsFn(filter, { field: 'amount', desc: true }, { page: grid.page, size: grid.size }).then((v) => {
      const { page, movements } = v.data?.movements ?? {};
      if (page) {
        grid.page = page.currentPage;
        grid.totalPages = Math.ceil(page.totalCount / (Number(grid.size) || 1));
        grid.totalCount = page.totalCount;
      }
      if (movements) {
        grid.allIds = movements.map(m => m.id);
        grid.selected.allSelected = false;
        grid.selected.selected = {};

        return movements.map(mapToVm);
      }

      console.log(JSON.stringify(v.errors));
      return []

    });

  });
}
