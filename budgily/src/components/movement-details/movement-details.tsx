import {
  $,
  QRL,
  QwikKeyboardEvent,
  Resource,
  Signal,
  component$,
  useComputed$,
  useResource$,
  useSignal,
  useStore,
  useStylesScoped$,
  useVisibleTask$
} from '@builder.io/qwik';

import styles from './movement-details.scss?inline';
import { MovementDetailsMovement, MovementDetailsProps, MovementDetailsStore, mapToVm } from './movement-details.types';
import { categorizeForDemo, getMovementByIdForDemo } from '@codedoc1/budgily-data-client';

export const MovementDetails = component$(({ store: appStore }: MovementDetailsProps) => {
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
      return { name: appStore.allCategories?.find((c) => c.id.toString() === existingCat.value)?.name, new: false };
    }
  });

  const movementResource = resourceMovementForId(appStore, state);

  toggleDialogOnSelectedMovementId(dialog, appStore);

  const onCategorize = onCategorizeHandler(newCat, appStore, state, existingCat);

  const onKey = keyboardNavigationAndCategorization(onCategorize, appStore, newCatInput);

  return (
    <>
      <dialog
        ref={dialog}
        class="modal"
        onClick$={(ev) => {
          if (ev.target === dialog.value) {
            dialog.value?.close();
            appStore.selectedId = undefined;
          }
        }}
        onKeyUp$={(key) => onKey(key)}
      >
        <div class="modal-box w-11/12 max-w-7xl">
          <h1 class="display-table">
            {' '}
            <span class="px-10 font-bold display-table-cell">Movement</span>{' '}
            <span class="display-table-cell">{appStore.selectedId}</span>
          </h1>
          <Resource
            value={movementResource}
            onRejected={(e) => <> {e.message ?? `Unknown error occurred loading ${appStore.selectedId}`} </>}
            onResolved={() => {
              return (
                <div class="h-100 pb-20">
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
                      data-tour="details-new-category"
                    ></input>
                    <select class="select select-bordered" bind:value={existingCat} data-tour="details-existing-category">
                      {appStore.allCategories?.map((c) => (
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
                    data-tour="select-previous-movement"
                    onClick$={() => appStore.previous && appStore.previous()}
                  >
                    &lt;
                  </button>
                  <button
                    class="btn btn-ghost absolute right-0 top-40"
                    title="next"
                    onClick$={() => appStore.next && appStore.next()}
                    data-tour="select-next-movement"
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
  <table data-tour="details-rows">
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

function keyboardNavigationAndCategorization(onCategorize: QRL<() => Promise<void>>, appStore: MovementDetailsProps['store'], newCatInput: Signal<HTMLInputElement | undefined>) {
  return $(({ key, altKey }: QwikKeyboardEvent) => {
    if (altKey && key === 'Enter') {
      onCategorize();
    } else if (key === 'ArrowLeft') {
      typeof appStore.previous === 'function' && appStore.previous();
      Promise.resolve().then(() => newCatInput.value?.focus());
    } else if (key === 'ArrowRight') {
      typeof appStore.next === 'function' && appStore.next();

      Promise.resolve().then(() => newCatInput.value?.focus());
    }
  });
}


function onCategorizeHandler(
  newCat: Signal<string | undefined>,
  store: MovementDetailsProps['store'],
  state: MovementDetailsStore,
  existingCat: Signal<string | undefined>
) {
  return $(async () => {
    if (newCat.value) {
      // new category
      const result = await categorizeForDemo({ category:{ name: newCat.value}, movementIds: [store.selectedId as string] });
      const createdCat = result;
      if(createdCat != null) {
         store.allCategories?.push(createdCat);
         existingCat.value = createdCat.id.toString();
      }
      newCat.value = undefined;
      state.movement &&
        (state.movement.categoriesStr = `${createdCat?.name}${state.movement?.categoriesStr.includes('---') ? '' : `,${state.movement?.categoriesStr}`
          }`);
    } else if (existingCat.value && store.selectedId != null) {
      // existing selected;
      await categorizeForDemo({categoryId: parseInt(existingCat.value), movementIds: Array.isArray(store.selectedId) ? store.selectedId : [store.selectedId] });
      const existingCatName = store.allCategories && store.allCategories.find((c) => c.id.toString() === existingCat.value)?.name;

      state.movement &&
        (state.movement.categoriesStr = `${existingCatName}${state.movement?.categoriesStr.includes('---') ? '' : `,${state.movement?.categoriesStr}`
          }`);
    }
  });
}

function toggleDialogOnSelectedMovementId(dialog: Signal<HTMLDialogElement | undefined>, appStore: MovementDetailsProps['store']) {
  useVisibleTask$(({ track, cleanup }) => {
    track(dialog);
    track(() => appStore.selectedId);

    if (dialog.value) {
      if (appStore.selectedId && !dialog.value.open) {
        dialog.value.showModal();
        dialog.value.focus();
      } else {
        dialog.value.close();
      }
    }

    cleanup(() => {
      if (dialog.value) {
        dialog.value.close();
      }
    });
  });
}

function resourceMovementForId(store: MovementDetailsProps['store'], state: MovementDetailsStore) {
  return useResource$(({ track }) => {
    track(() => store.selectedId);

    if (store.selectedId != null) {
      return getMovementByIdForDemo(store.selectedId).then((v) => {
        state.loading = false;
        if (v[0]) {
          state.movement = mapToVm(v[0]);
        } else {
          state.errorMessage = 'Not found';
        }
        return v;
      });
    }
  });
}
