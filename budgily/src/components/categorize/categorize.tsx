import { Signal, component$, useStylesScoped$, $, useComputed$, useSignal, useContext, NoSerialize } from '@builder.io/qwik';

import styles from './categorize.scss?inline';
import { CategorizeResponse, ClientContextType, categorize } from '@codedoc1/budgily-data-client';
import { AppStore } from 'budgily/src/core/app.store';
import { ClientContext } from 'budgily/src/core/client.context';

export type CategorizeProps = {
  store: AppStore;
  onCategorize: NoSerialize<(r: CategorizeResponse) => void>;
  wide?: boolean;
}

export const Categorize = component$(({ store: appStore, onCategorize: onCategorizeCallback, wide }: CategorizeProps) => {
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

  const onCategorize = onCategorizeHandler(useContext(ClientContext), newCat, existingCat, appStore, onCategorizeCallback)

  return <form
    method="dialog"
    preventdefault: submit
    onSubmit$={onCategorize}
    class="categorize-form py-2 px-5 block background-green-400 relative"
  >
    <div class={wide ? 'inline-block w-1/3' : ''}>
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
    <input type="submit" value="Categorize" class={`btn ${wide ? 'inline-block' : 'block'} m-1 btn-success`} />
  </form>;
});


function onCategorizeHandler(
  ctx: ClientContextType,
  newCat: Signal<string | undefined>,
  existingCat: Signal<string | undefined>,
  store: CategorizeProps['store'],
  onCategorize: NoSerialize<(r: CategorizeResponse) => void>
) {
  return $(async () => {
    const ids = store.selectedId;
    if (ids == null) {
      return
    }

    const mutationFn = categorize(ctx);
    const input = newCat.value ? { name: newCat.value, movementId: ids } : existingCat.value ? { id: existingCat.value, movementId: ids } : undefined;
    if (input) {
      await mutationFn(input)
        .then(({ data }) => {
          if (newCat.value && data?.categorize != null && data.categorize.id != null) {
            store.allCategories?.push(data.categorize);
          }
          // delegate to callback if any
          onCategorize && data && onCategorize(data)
        })
        .catch(e => {
          console.log(e);
        })
    }
  });
}

