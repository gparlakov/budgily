import { Resource, component$, useContext, useId, useResource$, useStore, useStyles$ } from '@builder.io/qwik';

import { Category, ClientContextType, Movement, MovementType, getDskReportsV2 } from '@codedoc1/budgily-data-client';
import { group, max } from 'd3';

import { ClientContext } from '../../core/client.context';
import { debounce } from '../../core/debounce';

import { MovementFilter } from '../../components/movement-filter/movement-filter';
import { MovementVm, ReportsLanding } from '../../components/reports-landing/reports-landing';
import global from './index.scss?inline';

const debounceMovementMillis = 300;
export default component$(() => {
  useStyles$(global);
  const ctx = useContext(ClientContext);

  const filter = useStore<{categories: string[], fromDate?: Date}>({categories: [], fromDate: new Date(2022, 8, 1)});
  const vm = useResource$(async ({track}) => {
    track(() => filter.categories)
    console.log('--change', filter)
    const abort = new AbortController();
    return mapToViewModel(await debouncedGetAllMovements(ctx, abort)(filter));
  });

  return (
    <>

      <MovementFilter filterStore={filter}></MovementFilter>
      <Resource
        value={vm}
        onResolved={({ errors, ...rest }) => (
          <>
            <ReportsLanding {...rest}></ReportsLanding>
            {Array.isArray(errors) ? errors.map((e) => <span key={useId()}>{JSON.stringify(e)}</span>) : ''}{' '}
          </>
        )}
        onPending={() => <>Loading...</>}
        onRejected={(e) => (
          <>
            Could not load <hr /> {JSON.stringify(e)}
          </>
        )}
      ></Resource>
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
