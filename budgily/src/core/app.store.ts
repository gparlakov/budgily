import { NoSerialize } from '@builder.io/qwik';
import { MovementFilter } from '@codedoc1/budgily-data-client';
import { CategoryVM, MovementVm } from './movement.types';

export type { MovementFilter } from '@codedoc1/budgily-data-client';

export interface AppStore {
  selectedId?: string;
  movements: NoSerialize<MovementVm[]>;
  maxSum: number;
  months: string[];
  allCategories: NoSerialize<CategoryVM[]>;
  filter: MovementFilter;
  next?: NoSerialize<() => void>;
  previous?: NoSerialize<() => void>;
}
