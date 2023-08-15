import { DemoCategory, ClientContextType, DemoMovement, MovementType, getDskReportsV2 } from '@codedoc1/budgily-data-client';
import { debounce } from './debounce';
import { MovementVm } from './movement.types';
import { group, max } from 'd3';

export function sumAmounts(ms?: { amount: number }[]): number {
  return Array.isArray(ms) ? ms.map((a) => a.amount).reduce((a, b) => a + b, 0) : 0;
}

export const debouncedGetAllMovements = (
  ctx: ClientContextType,
  abort: AbortController,
  debounceMovementMillis: number
) => debounce(getDskReportsV2(ctx, abort), debounceMovementMillis);

export function mapToViewModel({
  data,
  errors,
}: {
  data?: { movements: { movements: DemoMovement[] | undefined } };
  errors?: unknown[] | undefined;
}) {
  const movements: MovementVm[] =
    data?.movements?.movements?.map((d) => {
      const date = new Date(Number(d.date));
      return {
        amount: Number(d.amount),
        description: d.description ?? '',
        type: d.type === MovementType.Credit ? ('Credit' as const) : ('Debit' as const),
        date: date,
        id: d.id,
        categories: d.categories?.filter((c): c is DemoCategory => c != null).map((c) => ({ name: c.name })) ?? [],
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
