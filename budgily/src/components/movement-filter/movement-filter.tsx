import { QwikIntrinsicElements, Signal, component$, useId, useSignal, useStylesScoped$, useVisibleTask$ } from '@builder.io/qwik';

import {
  filterValueAllCategories,
  filterValueNoCategory,
  validDateString
} from '@codedoc1/budgily-data-client';

import { AppStore } from 'budgily/src/core/app.store';
import { CategoryVM } from 'budgily/src/core/movement.types';
import styles from './movement-filter.scss?inline';

export interface MovementFilterProps {
  filterStore: AppStore;
}
export const MovementFilter = component$(({ filterStore }: MovementFilterProps) => {
  useStylesScoped$(styles);

  return (
    <>
      <CategoryFilter filterStore={filterStore} />
      <DateRangeFilter filterStore={filterStore} />
      <SearchFilter filterStore={filterStore} />
    </>
  );
});

export interface CategoryFilterProps {
  filterStore: AppStore;
}
export const CategoryFilter = component$(({ filterStore }: CategoryFilterProps) => {

  const cats = [
    { id: filterValueAllCategories, name: 'All', selected: filterStore.filter.categories?.includes(filterValueAllCategories) },
    { id: filterValueNoCategory, name: 'No category', selected: filterStore.filter.categories?.includes(filterValueNoCategory) },
    ...(filterStore.allCategories as CategoryVM[]).map(c => ({ ...c, selected: filterStore.filter.categories?.includes(c.id) }))
  ];
  const ids = useSignal<string[]>([]);

  return (
    <div class="py-2 px-5 inline-block background-green-400 relative w-2/12">
      <select
        id="category"
        class="select select-bordered select-sm w-full"
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

export interface SearchFilterProps {
  filterStore: AppStore;
}
export const SearchFilter = component$(({ filterStore }: SearchFilterProps) => {

  const v = useId();
  const { search } = filterStore.filter;
  const searchV = useSignal(search ?? undefined)

  useVisibleTask$(({ track }) => {
    track(searchV);
    if (searchV.value != null && searchV.value != filterStore.filter.search) {
      filterStore.filter.search = searchV.value;
    };
  });

  return (
    <div class="py-2 px-5 inline-block w-3/12">
      <DebouncedInput debounce={300} output={searchV} type="text" value={searchV.value} id={v} class="input input-bordered input-sm w-lg" placeholder="search by description" />
    </div>
  );
});

export interface DateRangeFilterProps {
  filterStore: AppStore;
}
export const DateRangeFilter = component$(({ filterStore }: DateRangeFilterProps) => {

  const fromId = useId();
  const toId = useId();
  const { from, to } = filterStore.filter;
  const fromV = useSignal(from != null ? from.toISOString() : undefined)
  const toV = useSignal(to != null ? to.toISOString() : undefined);

  useVisibleTask$(({ track }) => {
    track(fromV);
    track(toV);

    filterStore.filter.from = validDateString(fromV.value) ? new Date(fromV.value!) : undefined;
    filterStore.filter.to = validDateString(toV.value) ? new Date(toV.value!) : undefined;
  })

  return (
    <div class="py-2 px-5 inline-block w-5/12">
      <label for={fromId}>Range </label><input type="date" bind: value={fromV} id={fromId} class="input input-bordered input-sm" />

      <span>-</span><input type="date" bind: value={toV} id={toId} class="input input-bordered input-sm" />
    </div>
  );
});

export type DebouncedInputProps = QwikIntrinsicElements['input'] & {
  debounce: number;
  output: Signal<string | undefined | null>;
}
export const DebouncedInput = component$(({ output, debounce, ...rest }: DebouncedInputProps) => {

  const input = useSignal<string | undefined>(undefined);
  useVisibleTask$(({ cleanup, track }) => {
    track(input);

    const timeout = setTimeout(() => {

      if (input.value != output.value) {
        output.value = input.value;
      }
    }, debounce)

    cleanup(() => clearTimeout(timeout));
  },{ strategy: 'intersection-observer' });

  return <input {...rest} bind:value={input} />;
});
