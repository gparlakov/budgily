import {
  $,
  QwikKeyboardEvent,
  Resource,
  Signal,
  component$,
  useComputed$,
  useContext,
  useResource$,
  useSignal,
  useStore,
  useStylesScoped$,
  useVisibleTask$,
} from '@builder.io/qwik';

import { ClientContextType, categorize, getMovementById } from '@codedoc1/budgily-data-client';
import { ClientContext } from '../../core/client.context';
import styles from './movement-details.scss?inline';
import { MovementDetailsMovement, MovementDetailsProps, MovementDetailsStore, mapToVm } from './movement-details.types';

export const MovementDetails = component$(({ store }: MovementDetailsProps) => {
  const ctx = useContext(ClientContext);
  useStylesScoped$(styles);

  const state = useStore<MovementDetailsStore>({ loading: true });
  const dialog = useSignal<HTMLDialogElement>();
  const newCatInput = useSignal<HTMLInputElement>();
  const newCat = useSignal<string>();
  const existingCat = useSignal<string>();
  const category = useComputed$(() => {
    if (newCat.value) {
      return { name: newCat.value, new: true };
    } else if (existingCat.value) {
      return { name: store.allCategories?.find((c) => c.id === existingCat.value)?.name, new: false };
    }
  });

  const movementResource = useMovements(store, ctx, state);

  useVisibleTask$(({ track }) => {
    track(dialog);
    track(() => store.selectedId);
    if (dialog.value && store.selectedId && !dialog.value.open) {
      dialog.value.showModal();
    }
  });

  const onCategorize = onCategorizeHandler(ctx, newCat, store, state, existingCat);

  const onKey = $(({ key, altKey }: QwikKeyboardEvent) => {
    if (altKey && key === 'Enter') {
      onCategorize();
    } else if (key === 'ArrowLeft') {
      typeof store.previous === 'function' && store.previous();
      Promise.resolve().then(() => newCatInput.value?.focus());
    } else if (key === 'ArrowRight') {
      typeof store.next === 'function' && store.next();

      Promise.resolve().then(() => newCatInput.value?.focus());
    }
  });

  return (
    <>
      <dialog
        ref={dialog}
        class="block"
        onClick$={(ev) => {
          if (ev.target === dialog.value) {
            dialog.value?.close();
            store.selectedId = undefined;
          }
        }}
      >
        <div>
          <h1 class="display-table">
            {' '}
            <span class="px-10 font-bold display-table-cell">Movement</span>{' '}
            <span class="display-table-cell">{store.selectedId}</span>
          </h1>
          <Resource
            value={movementResource}
            // onPending={() => (
            //   <>
            //     <Details movement={state.movement} />
            //   </>
            // )}
            onRejected={(e) => <> {e.message ?? `Unknown error occurred loading ${store.selectedId}`} </>}
            onResolved={() => {
              return (
                <div class="h-100 pb-20" window:onKeyUp$={(key) => onKey(key)}>
                  <Details movement={state.movement} />

                  <form
                    method="dialog"
                    preventdefault:submit
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
                      bind:value={newCat}
                      class="input input-bordered w-full max-w-xs"
                      ref={newCatInput}
                    ></input>
                    <select class="select select-bordered" bind:value={existingCat}>
                      {store.allCategories?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <input type="submit" value="Categorize" class="btn block m-1 btn-success"></input>
                  </form>
                  <button
                    class="btn btn-ghost absolute left-0 top-40"
                    title="previous"
                    onClick$={() => store.previous && store.previous()}
                  >
                    &lt;
                  </button>
                  <button
                    class="btn btn-ghost absolute right-0 top-40"
                    title="next"
                    onClick$={() => store.next && store.next()}
                  >
                    &gt;
                  </button>
                </div>
              );
            }}
          ></Resource>
        </div>
      </dialog>
    </>
  );
});

export const Details = (state: { movement?: MovementDetailsMovement }) => (
  <table>
    <tbody>
      <tr>
        <td class="px-10 font-bold">Amount</td>
        <td class="align-bottom hover:align-top">
          {state.movement?.type === 'credit' ? '+' : '-'}
          {state.movement?.amount}
        </td>
      </tr>
      <tr>
        <td class="px-10 font-bold">Description</td>
        <td class="align-bottom hover:align-top"> {state.movement?.description}</td>
      </tr>
      <tr>
        <td class="px-10 font-bold">Categories</td>
        <td class="align-bottom hover:align-top">{state.movement?.categoriesStr}</td>
      </tr>
      <tr>
        <td class="px-10 font-bold">Raw</td>
        <td class="align-bottom hover:align-top"> {state.movement?.raw}</td>
      </tr>
    </tbody>
  </table>
);

function onCategorizeHandler(
  ctx: ClientContextType,
  newCat: Signal<string | undefined>,
  store: MovementDetailsProps['store'],
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
        (state.movement.categoriesStr = `${createdCat?.name}${
          state.movement?.categoriesStr.includes('---') ? '' : `,${state.movement?.categoriesStr}`
        }`);
    } else if (existingCat.value) {
      // existing selected;
      await mutationFn({ id: existingCat.value, movementId: store.selectedId as string });
      const existingCatName = store.allCategories && store.allCategories.find((c) => c.id === existingCat.value)?.name;

      state.movement &&
        (state.movement.categoriesStr = `${existingCatName}${
          state.movement?.categoriesStr.includes('---') ? '' : `,${state.movement?.categoriesStr}`
        }`);
    }
  });
}

function useMovements(store: MovementDetailsProps['store'], ctx: ClientContextType, state: MovementDetailsStore) {
  return useResource$(({ track, cleanup }) => {
    track(() => store.selectedId);
    const abort = new AbortController();
    cleanup(() => abort.abort('cleanup'));

    const fn = getMovementById(ctx, abort);
    if (store.selectedId != null) {
      return fn(store.selectedId).then((v) => {
        state.loading = false;
        if (v.data?.movements[0]) {
          state.movement = mapToVm(v.data?.movements[0]);
        } else {
          state.errorMessage = JSON.stringify(v.errors);
        }
        return v;
      });
    }
  });
}
