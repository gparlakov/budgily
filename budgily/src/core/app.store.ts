import { NoSerialize } from '@builder.io/qwik';
import { MovementsFilter as Filter } from '@codedoc1/budgily-data-client';
import { CategoryVM, MovementVm } from './movement.types';

export type MovementsFilter = Omit<Filter, 'fromDate' | 'toDate'> & {
  from?: Date;
  to?: Date;
};

export interface AppStore {
  selectedId?: string | string[];
  movements: NoSerialize<MovementVm[]>;
  maxSum: number;
  months: string[];
  allCategories: NoSerialize<CategoryVM[]>;
  filter: MovementsFilter;
  next?: NoSerialize<() => void>;
  previous?: NoSerialize<() => void>;
}
