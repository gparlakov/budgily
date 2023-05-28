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
import { categorize, getMovementById } from '@codedoc1/budgily-data-client';

export const MovementDetails = component$(({ movementId, onClose$ }: MovementDetailsProps) => {
  const ctx = useContext(ClientContext);
  useStylesScoped$(styles);

  const state = useStore<MovementDetailsStore>({ loading: true });
  const dialog = useSignal<HTMLDialogElement>();

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

  useVisibleTask$(({ track }) => {
    track(() => dialog);
    console.log('---- modal modal')
    if (dialog.value) {
      console.log('---- opening modal')
      dialog.value.showModal();
    }
  });

  const onCategorize = $(async (event: QwikSubmitEvent<HTMLFormElement>) => {
    const form = new FormData(event.target as HTMLFormElement);
    const category = form.get('category') as string;
    // const r = await categorize(ctx)(category, movementId as string);

    // if(r.data) {
    //   state.movement = {...state.movement, categoriesStr: r.data.categorize.name};
    // }

  })

  return (
    <>
    {movementId}
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

                <form
                  method="dialog"
                  preventdefault:submit
                  onSubmit$={onCategorize}
                >
                  <input type="text" name="category"></input>

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
