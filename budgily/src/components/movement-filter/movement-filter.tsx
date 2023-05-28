import { $, QRL, Resource, component$, useContext, useResource$, useSignal, useStore, useStylesScoped$, useComputed$, useVisibleTask$ } from '@builder.io/qwik';

import {
  filterValueAllCategories,
  filterValueNoCategory,
  getCategories
} from '@codedoc1/budgily-data-client';
import { ClientContext } from '../../core/client.context';
import styles from './movement-filter.scss?inline';

export interface MovementFilterProps {
  filterStore?: {
    categories: string[];
  };
}
export const MovementFilter = component$(({ filterStore }: MovementFilterProps) => {
  useStylesScoped$(styles);
  const ctx = useContext(ClientContext);
  const categories = useResource$(({ cleanup }) => {
    const abort = new AbortController();
    cleanup(() => abort.abort());
    return getCategories(ctx, abort)();
  });

  return (
    <>
      <Resource
        value={categories}
        onResolved={(cs) => (
          <CategoryFilter
            categories={cs.data?.categories?.map(({ id, name }) => ({ id, name })) ?? []}
            onChange={$((ids: string[]) => {
              filterStore && (filterStore.categories = ids);
            })}
          />
        )}
        onPending={() => <>Categories loading...</>}
      />

    </>
  );
});

export interface CategoryFilterProps {
  onChange: QRL<(id: string[]) => void>;
  categories: { name: string; id: string }[];
}
export const CategoryFilter = component$(({ onChange, categories }: CategoryFilterProps) => {

  const cats = useStore<{id: string, name: string }[]>([
    { id: filterValueAllCategories, name: 'All' },
    { id: filterValueNoCategory, name: 'No category' },
    ...categories
  ]);
  const ids = useSignal<string[]>([]);
  const selectedNames = useComputed$(() => cats.filter(c => ids.value.includes(c.id)).map(c => c.name));

  const optionsShown = useSignal<boolean>(false);


  return (
    <div class="sm:col-span-3">
      <button onClick$={() => optionsShown.value = !optionsShown.value} class="relative cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
        <label for="category" class="block text-sm font-medium leading-6 text-gray-900">
          {Array.isArray(selectedNames.value) && selectedNames.value.length > 0 ? selectedNames.value.join() : 'Categories'}
        </label>
      </button>
      <div class="mt-2">
        {optionsShown.value && <select
          id="category"
          class="absolute block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
          onChange$={(e, select) => {
            const s = [...select.options].filter(o => o.selected).map(o => o.value);
            ids.value = s;
            onChange(s);
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
