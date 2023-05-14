import {
  component$,
  useContext,
  useStore,
  useStylesScoped$,
  useTask$,
  $,
  useResource$,
  Resource,
  useSignal,
  useVisibleTask$,
  QwikSubmitEvent,
} from '@builder.io/qwik';

import { ClientContext } from '../../core/client.context';
import styles from './movement-details.scss?inline';
import { MovementDetailsProps, MovementDetailsStore, mapToVm } from './movement-details.types';
import { categorize, getCategories, getMovementById } from '@codedoc1/budgily-data-client';
import { debounce } from '../../core/debounce';

export const MovementDetails = component$(({ movementId, onClose$ }: MovementDetailsProps) => {
  const ctx = useContext(ClientContext);
  useStylesScoped$(styles);

  const state = useStore<MovementDetailsStore>({ loading: true, categories: [], filteredCategories: [] });
  const dialog = useSignal<HTMLDialogElement>();
  const categoryInput = useSignal<string>();

  const movementResource = useResource$(({ track, cleanup }) => {
    track(() => movementId);
    const abort = new AbortController();
    cleanup(() => abort.abort('cleanup'));

    const fn = getMovementById(ctx, abort);
    if (typeof movementId === 'string') {
      return fn(movementId).then((v) => {
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

  const categoriesResource = useResource$(({ cleanup }) => {
    const abort = new AbortController();
    cleanup(() => abort.abort('cleanup categories resource'));

    return getCategories(ctx, abort)().then((v) => {
      const cats = v.data?.categories;
      state.categories = cats ?? [];
      return cats;
    });
  });

  useVisibleTask$(({ track }) => {
    track(() => dialog);
    if (dialog.value) {
      dialog.value.showModal();
    }
  });

  useVisibleTask$(({track}) => {
    track(() => categoryInput.value);
    track(() => state.categories);
    const cat = categoryInput.value;
    const filterCat = typeof cat === 'string' ? cat.toLocaleLowerCase() : undefined;

    state.filteredCategories = filterCat != null ? state.categories.filter(c => c.name.toLocaleLowerCase().includes(filterCat)) : state.categories;
  })

  const onCategorize = $(async (event: QwikSubmitEvent<HTMLFormElement>) => {
    const form = new FormData(event.target as HTMLFormElement);
    const category = form.get('category') as string;
    alert(`will categorize ${category} with maybe id ${state.selectedCategory?.id ?? '---'}`)
    // const r = await categorize(ctx)(category, movementId as string);

    // if (r.data) {
    //   state.movement = { ...state.movement, categoriesStr: r.data.categorize.name };
    // }
  });

  return (
    <>
      <dialog ref={dialog} onClick$={[$(() => dialog.value?.close()), onClose$]}>
        <h1>Movement: {movementId}</h1>
        <Resource
          value={movementResource}
          onPending={() => <>Loading... {movementId}</>}
          onRejected={(e) => <> {e.message ?? `Unknown error occurred loading ${movementId}`} </>}
          onResolved={() => {
            return (
              <div onClick$={(event) => event.stopPropagation()}>
                <div>
                  <div>
                    <label>Amount:</label> {state.movement?.type === 'CREDIT' ? '-' : '+'}
                    {state.movement?.amount}
                  </div>
                  <div>
                    <label>Description:</label> {state.movement?.description}
                  </div>
                  <div>
                    <label>Categories:</label>
                    {state.movement?.categoriesStr}
                  </div>
                  <div>
                    <label>Raw:</label> {state.movement?.raw}
                  </div>
                </div>

                <form method="dialog" preventdefault:submit onSubmit$={onCategorize}>
                  <Resource
                    value={categoriesResource}
                    onPending={() => <>Loading categories...</>}
                    onResolved={(v) => <>Categories: {v?.length ?? 0}</>}
                    />
                  <input type="text" name="category" autoComplete="off" bind:value={categoryInput}></input>
                  {state.filteredCategories.map((c) => <div onClick$={() => {categoryInput.value = c.name; state.selectedCategory = c}} key={c.id}>{c.name}</div>)}
                  <input type="submit" value="Categorize"></input>
                </form>
              </div>
            );
          }}
        ></Resource>
      </dialog>
    </>
  );
});
