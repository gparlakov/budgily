import { noSerialize, Resource, component$, useContext, useId, useResource$, useStore, useStyles$, NoSerialize } from '@builder.io/qwik';

import { Category, ClientContextType, Movement, MovementType, getDskReportsV2 } from '@codedoc1/budgily-data-client';
import { group, max } from 'd3';

import { ClientContext } from '../../core/client.context';
import { debounce } from '../../core/debounce';

import { MovementFilter } from '../../components/movement-filter/movement-filter';
import { ReportsLanding } from '../../components/reports-landing/reports-landing';
import { MovementVm } from '../../core/movement.types';

import global from './index.scss?inline';
import { MovementDetails } from 'budgily/src/components/movement-details/movement-details';

const debounceMovementMillis = 300;
export default component$(() => {
  useStyles$(global);
  const ctx = useContext(ClientContext);

  const filter = useStore<{ categories: string[], fromDate?: Date }>({ categories: [], fromDate: new Date(2022, 8, 1) });
  const appStore = useStore<{
    selectedId?: string;
    movements: NoSerialize<MovementVm[]>;
    maxSum: number;
    months: string[];
  }>({ movements: noSerialize([]), maxSum: 0, months: [] });
  const vm = useResource$(async ({ track, cleanup }) => {
    track(filter);
    const abort = new AbortController();
    cleanup(() => abort.abort());
    return debouncedGetAllMovements(ctx, abort)(filter).then(mapToViewModel).then(({ errors, maxSum, months, movements }) => {
      appStore.movements = noSerialize(movements);
      appStore.maxSum = maxSum;
      appStore.months = months;
      return { errors };
    });
  });

  return (
    <>
      <MovementFilter filterStore={filter} ></MovementFilter>
      <button onClick$={() => filter.categories = [...filter.categories]}>🔁</button> {/* this button and its onClick handler is a hack to make the change detection work */}
      <Resource
        value={vm}
        onResolved={({ errors }) => (
          <>
            <ReportsLanding movementDetailsStore={appStore}></ReportsLanding>
            {Array.isArray(errors) ? errors.map((e) => <span key={useId()}>{JSON.stringify(e)}</span>) : ''}{' '}
          </>
        )}
        onPending={() => <>Loading...</>}
        onRejected={(e) => (
          <>
            Could not load movements. Error follows (if any): <hr /> {JSON.stringify(e)}
          </>
        )}
      ></Resource>
      <MovementDetails movementId={appStore.selectedId} onClose$={() => appStore.selectedId = undefined}></MovementDetails>
    </>
  );
});

export function sumAmounts(ms?: { amount: number }[]): number {
  return Array.isArray(ms) ? ms.map((a) => a.amount).reduce((a, b) => a + b, 0) : 0;
}

export const debouncedGetAllMovements = (ctx: ClientContextType, abort: AbortController) =>
  debounce(getDskReportsV2(ctx, abort), debounceMovementMillis);

export function mapToViewModel({
  data,
  errors,
}: {
  data?: { movements: Movement[] | undefined };
  errors?: unknown[] | undefined;
}) {
  const movements: MovementVm[] =
    data?.movements?.map((d) => {
      const date = new Date(Number(d.date));
      return {
        amount: Number(d.amount),
        description: d.description ?? '',
        type: d.type === MovementType.Credit ? ('Credit' as const) : ('Debit' as const),
        date: date,
        id: d.id,
        categories: d.categories?.filter((c): c is Category => c != null).map((c) => ({ name: c.name })) ?? [],
        month: `${date.getMonth() + 1}-${date.getFullYear()}`,
      } as MovementVm;
    }) ?? [];

  const monthly = group(
    movements,
    (m) => m.month,
    (m) => m.type
  );

  const monthlyCreditOrDebit = [...monthly.values()].flatMap((m) => [...m.values()]);
  const monthlyCreditOrDebitSums = monthlyCreditOrDebit.map(sumAmounts);
  const maxSum = max(monthlyCreditOrDebitSums) ?? 25000;

  return {
    errors: errors?.map((e) => (typeof e === 'string' ? e : JSON.stringify(e))),
    movements,
    maxSum,
    months: [...new Set(movements.map((m) => m.month))],
  };
}
