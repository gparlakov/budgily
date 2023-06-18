import { NoSerialize, Resource, component$, useContext, useResource$, useStore, useStylesScoped$ } from '@builder.io/qwik';

import styles from './movements-grid.scss?inline';
import { CategoryVM } from 'budgily/src/core/movement.types';
import { ClientContext } from 'budgily/src/core/client.context';
import { ClientContextType } from '@codedoc1/budgily-data-client';
import { Pagination } from '@qwik-ui/tailwind'
import { debouncedGetAllMovements } from 'budgily/src/core/movements.fetch';
import { mapToVm } from '../movement-details/movement-details.types';
import { AppStore } from 'budgily/src/core/app.store';

export const MovementsGrid = component$(({ appStore }: MovementsGridProps) => {
  useStylesScoped$(styles);
  const ctx = useContext(ClientContext);
  const grid = useStore<MovementsGrid>({ page: 1, size: 20 })
  const movements = resourceMovementsPaginated(ctx, grid, appStore);

  return <>
    <Resource value={movements} onResolved={(ms) => <>
      {ms.map(m => <div>{m.description}</div>)}
      <div>before <Pagination pages={grid.totalPages} page={grid.page}> test mest</Pagination> after</div>
    </>} />
  </>;
});

export interface MovementsGridProps {
  appStore: AppStore;
}

export interface MovementsGrid {
  page: number;
  size: number;
  totalPages?: number;
  totalCount?: number;
}

function resourceMovementsPaginated(ctx: ClientContextType, grid: MovementsGrid, { filter }: MovementsGridProps['appStore']) {

  return useResource$(({ track, cleanup }) => {
    track(grid);
    const abort = new AbortController();
    cleanup(() => abort.abort('cleanup'));
    const movementsFn = debouncedGetAllMovements(ctx, abort, 300)

    return movementsFn(filter, { field: 'amount', desc: true }, { page: grid.page, size: grid.size }).then((v) => {
      const { page, movements } = v.data?.movements ?? {};
      if (page) {
        grid.page = page.currentPage;
        grid.size = page.pageCount;
        grid.totalPages = Math.ceil(page.totalCount / (Number(page.count) || 1));
      }
      if (movements) {
        return movements.map(mapToVm);
      }

      console.log(JSON.stringify(v.errors));
      return []

    });

  });
}
