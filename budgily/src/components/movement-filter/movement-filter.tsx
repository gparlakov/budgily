import { NoSerialize, component$, useSignal, useStylesScoped$ } from '@builder.io/qwik';

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
    { id: filterValueAllCategories, name: 'All' },
    { id: filterValueNoCategory, name: 'No category' },
    ...filterStore.allCategories as CategoryVM[]
  ];
  const ids = useSignal<string[]>([]);
  const selectedNames = () => {
    const none = 'Categories';
    const selected = cats.filter(c => ids.value.some(id => id == c.id)).map(c => c.name);

    return selected.length > 0 ? selected.join() : none;
  };

  const optionsShown = useSignal<boolean>(false);

  return (
    <div class="sm:col-span-3">
      <button onClick$={() => optionsShown.value = !optionsShown.value} class="relative cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
        <label for="category" class="block text-sm font-medium leading-6 text-gray-900">
          {selectedNames()}
        </label>
      </button>
      <div class="mt-2">
        {optionsShown.value && <select
          id="category"
          class="absolute block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
          onChange$={(e, select) => {
            const s = [...select.options].filter(o => o.selected).map(o => o.value);
            ids.value = s;
            filterStore.filter.categories = s;
          }}
          multiple
        >
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>}
      </div>
    </div>
  );
});
