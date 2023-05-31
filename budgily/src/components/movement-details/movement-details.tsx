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
  // only temp
  useVisibleTask$(() => {
    store.selectedId = store.selectedId || "ffvNzzREbISXiW2JAQNHVnE7Gr3JL4ZyVkukbJNK7Gs=";
  })
  const ctx = useContext(ClientContext);
  useStylesScoped$(styles);

  const state = useStore<MovementDetailsStore>({ loading: true });
  const dialog = useSignal<HTMLDialogElement>();
  const catInput = useSignal<string>();
  const selectedCategory = useSignal<{ id: string, name: string }>();

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
      <dialog ref={dialog}
        class="min-h-500 pt-10 block"
        onClick$={(ev) => {
          if (ev.target === dialog.value) {
            dialog.value?.close();
            store.selectedId = undefined;
          }
        }
        }>
        <h1 class="display-table"> <span class="px-10 font-bold display-table-cell">Movement</span> <span class="display-table-cell">{store.selectedId}</span></h1>
        <Resource
          value={movementResource}
          onPending={() => <>Loading... {store.selectedId}</>}
          onRejected={(e) => <> {e.message ?? `Unknown error occurred loading ${store.selectedId}`} </>}
          onResolved={() => {
            return (
              <div onClickCapture$={() => true} >
                <table>
                  <tbody>
                    <tr>
                      <td class="px-10 font-bold">Amount</td>
                      <td class="align-bottom hover:align-top">{state.movement?.type === 'Credit' ? '-' : '+'}
                        {state.movement?.amount}</td>
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

                <form
                  method="dialog"
                  preventdefault:submit
                  onSubmit$={onCategorize}
                  class="categorize-form"
                >
                  <div class="py-2 px-5 inline-block background-green-400 relative">

                    {selectedCategory.value && <span class="pill">{selectedCategory.value.name} <button onClick$={() => selectedCategory.value = undefined}>x</button></span>}
                    <input type="text" placeholder="Select category" name="category" autoComplete="off" bind:value={catInput} class="input input-bordered w-full max-w-xs"></input>
                    <div class="dropdown dropdown-top dropdown-end absolute top-3 right-5">
                      <label tabIndex={0} class="btn btn-xs btn-ghost">
                        <svg class="h-4 w-4 fill-current md:h-8 md:w-8 " xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" ></path></svg>
                      </label>
                      <ul tabIndex={0} class="dropdown-content menu p-0 shadow bg-base-100 rounded-box w-52 max-h-16 ">
                        {store.allCategories?.map(c => <li class="space-0.5" key={c.id}><a onClick$={() => { selectedCategory.value = c; catInput.value = c.name }}>{c.name}</a></li>)}
                      </ul>
                    </div>
                  </div>

                  <input type="submit" value="Categorize" class="btn m-1 btn-ghost btn-xs"></input>
                </form>
              </div>
            );
          }}
        ></Resource>
      </dialog>
    </>
  );
});

function getCategories() {
  return useResource$(() => {
    return Promise.resolve([]);
  })
}
