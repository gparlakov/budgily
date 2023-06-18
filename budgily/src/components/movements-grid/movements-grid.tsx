import { Resource, component$, useContext, useResource$, useStore, useStylesScoped$ } from '@builder.io/qwik';

import { ClientContextType } from '@codedoc1/budgily-data-client';
import { Pagination } from '@qwik-ui/tailwind';
import { AppStore } from 'budgily/src/core/app.store';
import { ClientContext } from 'budgily/src/core/client.context';
import { debouncedGetAllMovements } from 'budgily/src/core/movements.fetch';
import { mapToVm } from '../movement-details/movement-details.types';
import styles from './movements-grid.scss?inline';

export const MovementsGrid = component$(({ appStore }: MovementsGridProps) => {
  useStylesScoped$(styles);
  const ctx = useContext(ClientContext);
  const grid = useStore<MovementsGrid>({ page: 1, size: 20, selected: [], allIds: [] })
  const movements = resourceMovementsPaginated(ctx, grid, appStore);

  return <>
    <Resource value={movements} onResolved={(ms) => <>
      <div class="overflow-x-auto">
        <table class="table table-xs table-pin-rows">
          <thead>
            <tr>
              <th><input type="checkbox" checked={grid.selected.length > 0 && grid.selected.length === grid.allIds.length}
                onClick$={() => grid.selected.length > 0 ? grid.selected = [] : grid.selected = [...grid.allIds]} /> </th>
              <th>Amount</th>
              <th>Description</th>
              <th>Type</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {ms.map(m => <tr key={m.id}>
              <th><input type="checkbox" value={m.id}
                checked={grid.selected.includes(m.id)}
                onClick$={() => {
                  grid.selected = grid.selected.includes(m.id) ? grid.selected.filter(s => s === m.id) : [...grid.selected, m.id]
                }} /></th>
              <td>{m.amount}</td>
              <td>{m.description}</td>
              <td>{m.type}</td>
              <td>{m.date}</td>
            </tr>)}
          </tbody>
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
  selected: string[];
}

function resourceMovementsPaginated(ctx: ClientContextType, grid: MovementsGrid, { filter }: MovementsGridProps['appStore']) {

  return useResource$(({ track, cleanup }) => {
    track(() => grid.page);
    track(() => grid.size);
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
        return movements.map(mapToVm);
      }

      console.log(JSON.stringify(v.errors));
      return []

    });

  });
}
