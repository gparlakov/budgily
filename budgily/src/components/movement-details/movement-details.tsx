import {
  $,
  QwikSubmitEvent,
  Resource,
  component$,
  useContext,
  useResource$,
  useSignal,
  useStore,
  useStylesScoped$,
  useVisibleTask$
} from '@builder.io/qwik';

import { getMovementById } from '@codedoc1/budgily-data-client';
import { ClientContext } from '../../core/client.context';
import styles from './movement-details.scss?inline';
import { MovementDetailsProps, MovementDetailsStore, mapToVm } from './movement-details.types';

export const MovementDetails = component$(({ store }: MovementDetailsProps) => {
  const ctx = useContext(ClientContext);
  useStylesScoped$(styles);

  const state = useStore<MovementDetailsStore>({ loading: true });
  const dialog = useSignal<HTMLDialogElement>();
  const catInput = useSignal<string>();

  const movementResource = useResource$(({ track, cleanup }) => {
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

  useVisibleTask$(({ track }) => {
    track(dialog);
    track(() => store.selectedId);
    if (dialog.value && store.selectedId) {
      dialog.value.showModal();
    }
  });

  const onCategorize = $(async (event: QwikSubmitEvent<HTMLFormElement>) => {
    const form = new FormData(event.target as HTMLFormElement);
    const category = form.get('category') as string;
    // const r = await categorize(ctx)(category, selectedId as string);

    // if(r.data) {
    //   state.movement = {...state.movement, categoriesStr: r.data.categorize.name};
    // }

  })

  return (
    <>
      <button ></button>
      <dialog ref={dialog} onClick$={[$(() => dialog.value?.close()), $(() => { store.selectedId = undefined; })]}>
        <h1>Movement: {store.selectedId}</h1>
        <Resource
          value={movementResource}
          onPending={() => <>Loading... {store.selectedId}</>}
          onRejected={(e) => <> {e.message ?? `Unknown error occurred loading ${store.selectedId}`} </>}
          onResolved={() => {
            return (
              <div onClick$={(event) => event.stopPropagation()} >
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

                <form
                  method="dialog"
                  preventdefault:submit
                  onSubmit$={onCategorize}
                  class="categorize-form"
                >
                  <input type="text" name="category" autoComplete="off" bind:value={catInput}></input>
                  {catInput}
                  <ul>
                    {store.categories?.map(c => <li key={c.id}>{c.name}</li>)}
                  </ul>

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

function getCategories () {
  return useResource$(() => {
    return Promise.resolve([]);
  })
}
