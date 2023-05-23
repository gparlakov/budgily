import { $, QRL, Resource, component$, useContext, useResource$, useSignal, useStylesScoped$ } from '@builder.io/qwik';

import {
  ClientContextType,
  filterValueAllCategories,
  filterValueNoCategory,
  getCategories,
} from '@codedoc1/budgily-data-client';
import { ClientContext } from '../../core/client.context';
import styles from './movement-filter.scss?inline';

export interface MovementFilterProps {
  filterStore: {
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
    {filterStore.categories.map(c => <span key={c}>{c}</span>)}
    <Resource
      value={categories}
      onResolved={(cs) => (
        <CategoryFilter
          categories={cs.data?.categories?.map(({ id, name }) => ({ id, name })) ?? []}
          onChange={$((ids: string[]) => {filterStore.categories = ids;})}
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

  const optionsShown = useSignal<boolean>(false);

  return (
    <div class="sm:col-span-3">
      <button onClick$={() => optionsShown.value = !optionsShown.value} class="relative cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
        <label for="category" class="block text-sm font-medium leading-6 text-gray-900">
          Country
        </label>
      </button>
      <div class="mt-2">
        {optionsShown.value && <select
          id="category"
          class="absolute block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
          onChange$={(e) => {
            onChange(
              [...e.target.childNodes]
                .filter((n): n is HTMLOptionElement => 'selected' in n && n.selected == true)
                .map((n) => n.value)
            );
          }}
          multiple
        >
          <option value={filterValueAllCategories}>All</option>
          <option value={filterValueNoCategory}>No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>}
      </div>
    </div>
  );
});

const categories = (ctx: ClientContextType, abort: AbortController) => getCategories(ctx, abort);
