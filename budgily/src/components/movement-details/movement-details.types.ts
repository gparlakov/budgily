import { NoSerialize } from '@builder.io/qwik';
import { Category, Movement, MovementType } from '@codedoc1/budgily-data-client';
import { CategoryVM } from '../../core/movement.types';

export interface MovementDetailsProps {
  store: {
    selectedId?: string | string[];
    allCategories: NoSerialize<CategoryVM[]>
    next?: NoSerialize<() => void>;
    previous?: NoSerialize<() => void>;
  }
}

export type MovementDetailsMovement = {
  id: string;
  amount: number;
  date: string;
  categories: {
    id?: number | null;
    name: string;
    description?: string | null;
  }[];
  categoriesStr: string;
  raw: string;
  account?: string;
  description?: string;
  opposite?: string | null;
  type: 'credit' | 'debit';
};

export interface MovementDetailsStore {
  selectedCategory?: CategoryVM;
  loading: boolean;
  movement?: MovementDetailsMovement;
  errorMessage?: string;
  categories?: CategoryVM[];
  filteredCategories?: CategoryVM[];
}

export function mapToVm({
  id,
  amount,
  date,
  description,
  raw,
  account,
  categories,
  opposite,
  type,
}: Movement): MovementDetailsMovement {
  const cats = categories?.filter((c): c is Category => c != null);
  const categoriesStr = Array.isArray(cats) && cats.length > 0 ? cats?.map((c) => c.name).join(',') : '-----';

  return {
    id,
    amount,
    date,
    raw,
    account: account ?? '-',
    description,
    opposite,
    type: type === MovementType.Credit ? 'credit' : 'debit',
    categories: cats ?? [],
    categoriesStr,
  };
}
