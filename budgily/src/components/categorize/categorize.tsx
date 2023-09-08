import { Signal, component$, useStylesScoped$, $, useComputed$, useSignal, useContext, NoSerialize, QwikIntrinsicElements, useStore } from '@builder.io/qwik';

import styles from './categorize.scss?inline';
import { CategorizeResponse, ClientContextType, categorize, categorizeForDemo } from '@codedoc1/budgily-data-client';
import { AppStore } from 'budgily/src/core/app.store';
import { ClientContext } from 'budgily/src/core/client.context';

export type CategorizeProps = {
  store: AppStore;
  onCategorize?: NoSerialize<(r: CategorizeResponse) => void>;
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
      return { name: appStore.allCategories?.find((c) => c.id.toString() === existingCat.value)?.name, new: false };
    }
  });
  const loading = useSignal<boolean>(false);

  const onCategorize = onCategorizeHandler(useContext(ClientContext), newCat, existingCat, appStore, onCategorizeCallback, loading)

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
    <div class="join">
      <input
        type="text"
        placeholder="New category"
        name="category"
        autoComplete="off"
        bind: value={newCat}
        class="input input-bordered w-full max-w-xs"
        ref={newCatInput}
        data-tour="categorize-control-new"
      ></input>
      <select class="select select-bordered" bind: value={existingCat}
        data-tour="categorize-control-existing">
        {appStore.allCategories?.map((c) => (
          <option key={c.id} value={c.id} selected={c.id.toString() === existingCat.value}>
            {c.name}
          </option>
        ))}
      </select>
    </div>

    <button type="submit" class={`btn ${wide ? 'inline-block' : 'block'} m-1 btn-success`}>
      {loading.value ? <span class="loading loading-spinner"></span> : 'Categorize'}
    </button>
  </form>;
});


function onCategorizeHandler(
  ctx: ClientContextType,
  newCat: Signal<string | undefined>,
  existingCat: Signal<string | undefined>,
  store: CategorizeProps['store'],
  afterCategorize: NoSerialize<(r: CategorizeResponse) => void>
  , loading: Signal<boolean>
) {
  return $(async () => {

    if (store.selectedId == null) {
      return
    }

    const isNew = typeof newCat.value === 'string' && newCat.value.trim() != '';

    const ids = Array.isArray(store.selectedId) ? [...store.selectedId] : [store.selectedId];
    const input = isNew ? { category: { name: newCat.value!, movementIds: ids }, movementIds: ids }
      : existingCat.value ? { categoryId: parseInt(existingCat.value), movementIds: ids }
        : undefined;
    if (input) {
      loading.value = true;
      await categorizeForDemo(input)
        .then((c) => {
          loading.value = false;
          if (newCat.value != null && c?.id != null) {
            store.allCategories?.push({...c, id: c.id });
            newCat.value = '';
          }
          existingCat.value = c?.id?.toString();
          // delegate to callback if any
          afterCategorize && c && afterCategorize({categorize: {...c, id: c.id.toString()}})
        })
        .catch(e => {
          console.log(e);
          loading.value = false
        })
    }
  });
}

// export type ComboboxProps = QwikIntrinsicElements['div'] & {
//   items: (search?: string) => Array<{
//     id: string;
//     value: string;
//     displayStr: string;
//   }>

//   selectedValue?: string;
// }


// export const Combobox = component$(({ items, selectedValue }: ComboboxProps) => {

//   const boxStore = useStore({
//     selected: useSignal(selectedValue),
//     input: useSignal(selectedValue && items().find(i => i.value === selectedValue)?.displayStr)
//   })

//   return <>
//     <input
//       type="text"
//       placeholder="New category"
//       name="category"
//       autoComplete="off"
//       bind: value={boxStore.selected}
//       class="input input-bordered w-full max-w-xs"
//     ></input>
//     <select class="select select-bordered" bind: value={boxStore.selected}>
//       {items(boxStore.input.value).map((c) => (
//         <option key={c.id} value={c.id}>
//           {c.displayStr}
//         </option>
//       ))}
//     </select>
//   </>
// })
