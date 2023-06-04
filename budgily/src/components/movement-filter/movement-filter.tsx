import { NoSerialize, component$, useComputed$, useSignal, useStylesScoped$ } from '@builder.io/qwik';

import {
  filterValueAllCategories,
  filterValueNoCategory,
} from '@codedoc1/budgily-data-client';

import { CategoryVM } from 'budgily/src/core/movement.types';
import styles from './movement-filter.scss?inline';

export interface MovementFilterProps {
  filterStore: {
    filter: { categories: string[]; },
    allCategories: NoSerialize<CategoryVM[]>;
  };
}
export const MovementFilter = component$(({ filterStore }: MovementFilterProps) => {
  useStylesScoped$(styles);

  return (
    <>
      <CategoryFilter filterStore={filterStore} />
    </>
  );
});

export interface CategoryFilterProps {
  filterStore: {
    filter: { categories: string[]; },
    allCategories: NoSerialize<CategoryVM[]>;
  };
}
export const CategoryFilter = component$(({ filterStore }: CategoryFilterProps) => {

  const cats = [
    { id: filterValueAllCategories, name: 'All',selected: filterStore.filter.categories?.includes(filterValueAllCategories) },
    { id: filterValueNoCategory, name: 'No category', selected: filterStore.filter.categories?.includes(filterValueNoCategory) },
    ...(filterStore.allCategories as CategoryVM[]).map(c => ({...c, selected: filterStore.filter.categories?.includes(c.id)}))
  ];
  const ids = useSignal<string[]>([]);

  return (
    <div class="py-2 px-5 inline-block background-green-400 relative">
      <select
        id="category"
        class="select select-bordered select-sm"
        onChange$={(e, select) => {
          const s = [...select.options].filter(o => o.selected).map(o => o.value);
          ids.value = s;
          filterStore.filter.categories = s;
        }}
      >
        {cats.map((c) => (
          <option key={c.id} value={c.id} selected={c.selected}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
});
