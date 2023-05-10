import { PropFunction, Signal } from '@builder.io/qwik';
import { Category, Movement } from '@codedoc1/budgily-data-client';

export interface MovementDetailsProps {
  movementId?: string;
  onClose$?: PropFunction<() => void>;
}

interface CategoryVM {
  id: string;
  name: string;
  movementIds: string[];
  description?: string;
}

export interface MovementDetailsStore {
  selectedCategory: CategoryVM;
  loading: boolean;
  movement?: {
    id: string;
    amount: number;
    date: string;
    categories: { id?: number | null ; name: string; description?: string | null }[];
    categoriesStr: string;
    raw: string;
    account?: string;
    description?: string;
    opposite?: string | null;
    type: string;
  };
  errorMessage?: string;
  categories: CategoryVM[];
  filteredCategories: CategoryVM[];
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
}: Movement): MovementDetailsStore['movement'] {
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
    type,
    categories: cats ?? [],
    categoriesStr,
  };
}
