import { Signal, component$, useStylesScoped$, $, useComputed$, useSignal } from '@builder.io/qwik';

import styles from './categorize.scss?inline';
import { ClientContextType, categorize } from '@codedoc1/budgily-data-client';
import { AppStore } from 'budgily/src/core/app.store';
import { MovementDetailsStore } from '../movement-details/movement-details.types';
export type CategorizeProps = {
  store: AppStore
}
export const Categorize = component$(({store: appStore}: CategorizeProps) => {
  useStylesScoped$(styles);

  const newCatInput = useSignal<HTMLInputElement>();
  const newCat = useSignal<string>();
  const existingCat = useSignal<string>();
  const category = useComputed$(() => {
    if (newCat.value) {
      return { name: newCat.value, new: true };
    } else if (existingCat.value) {
      return { name: appStore.allCategories?.find((c) => c.id === existingCat.value)?.name, new: false };
    }
  });

  const onCategorize = onCategorizeHandler(ctx, newCat, appStore, undefined, existingCat)

  return <form
    method="dialog"
    preventdefault: submit
    onSubmit$={onCategorize}
    class="categorize-form py-2 px-5 block background-green-400 relative"
  >
    <div>
      Category: {category.value?.name}
      <sup>{category.value && (category.value.new ? 'new' : 'existing')}</sup>
    </div>
    <input
      type="text"
      placeholder="New category"
      name="category"
      autoComplete="off"
      bind: value={newCat}
      class="input input-bordered w-full max-w-xs"
      ref={newCatInput}
    ></input>
    <select class="select select-bordered" bind: value={existingCat}>
      {appStore.allCategories?.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
    <input type="submit" value="Categorize" class="btn block m-1 btn-success"></input>
  </form>;
});


function onCategorizeHandler(
  ctx: ClientContextType,
  newCat: Signal<string | undefined>,
  store: CategorizeProps['store'],
  state: MovementDetailsStore,
  existingCat: Signal<string | undefined>
) {
  return $(async () => {
    const mutationFn = categorize(ctx);
    if (newCat.value) {
      // new category
      const result = await mutationFn({ name: newCat.value, movementId: store.selectedId as string });
      const createdCat = result.data?.categorize;
      createdCat && createdCat.id && store.allCategories?.push(createdCat);
      newCat.value = undefined;
      state.movement &&
        (state.movement.categoriesStr = `${createdCat?.name}${state.movement?.categoriesStr.includes('---') ? '' : `,${state.movement?.categoriesStr}`
          }`);
    } else if (existingCat.value) {
      // existing selected;
      await mutationFn({ id: existingCat.value, movementId: store.selectedId as string });
      const existingCatName = store.allCategories && store.allCategories.find((c) => c.id === existingCat.value)?.name;

      state.movement &&
        (state.movement.categoriesStr = `${existingCatName}${state.movement?.categoriesStr.includes('---') ? '' : `,${state.movement?.categoriesStr}`
          }`);
    }
  });
}

