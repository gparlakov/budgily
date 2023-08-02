import {
    Slot,
    component$,
    useStore,
    $,
    createContextId,
    useContextProvider,
    QRL,
    QwikIntrinsicElements,
    useContext
  } from '@builder.io/qwik';
  import { Button } from '@qwik-ui/tailwind';


export type WizardContext = {
    onPage$: QRL<(id: number) => void>;
    state: {
      current: number
    },
    next$: QRL<() => void>,
    prev$: QRL<() => void>,
  }

  export const WizardContextId = createContextId<WizardContext>('Wizard_context');


  export const WizardV2 = component$(({ steps: stepCount }: { steps: number }) => {
    const steps = Array.from({ length: stepCount }).map((_,i) => i);
    const w = useStore({
      current: 0,
      nextDisabled: false,
      prevDisabled: true
    });

    const wiz = {
      state: w,
      next$: $(() => {
        const hasNext = w.current + 1 < stepCount;
        if (hasNext) {
          w.prevDisabled = false;
          w.current += w.current + 1;
        }
      }),
      prev$: $(() => {
        const hasPrev = w.current - 1 >= 0;
        if (hasPrev) {
          w.current = w.current - 1;
          w.nextDisabled = false;
        }
      }),
      onPage$: $((id: number) => {
        if (w.current === id) {
          return;
        }

        w.current = id;
        w.nextDisabled = id + 1 >= stepCount;
        w.prevDisabled = id - 1 < 0;
      })
    };

    useContextProvider(WizardContextId, wiz);

    return (<>
      <div class="hero min-h-screen w-full bg-base-200">
        <div class="hero-content w-full">
          <div class="w-full">
            <div class="text-sm breadcrumbs">
              {/* <ul>
                {
                  steps
                    .filter((s) => s <= w.current)
                    .map((s) => <Slot key={s} name={`crumb${s}`} />)
                }
              </ul> */}
            </div>
            <div class="text-center">
              {
                steps
                  // .filter((i) => i === w.current)
                  .map((i) => <Slot key={`title-${i}`} name={`title-${i}`} />)
              }
              <div class="card w-full shadow-2xl bg-base-100 items-center">
                <div class="card-body">

                  {
                    steps
                      .filter((i) => i === w.current)
                      .map((i) => <Slot key={`step-${i}`} name={`step-${i}`} />)
                  }

                </div>

                <div class="card-actions">
                  <Button
                    class="btn-secondary"
                    onClick$={wiz.prev$}
                    disabled={w.prevDisabled}
                  >Prev</Button>

                  <Button
                    class="btn-primary"
                    onClick$={wiz.next$}
                    disabled={w.nextDisabled}
                  >Next</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>)
  })


  export type WizardStepProps = {
    id: number
  }
  export const WizardStep = component$(({ id, }: WizardStepProps) => {
    return <>
      {id}
      <Slot />
    </>
  })

  export type WizardTitleProps = {} & QwikIntrinsicElements['h1'];
  export const WizardTitle = component$((props: WizardTitleProps) => {
    const ctx = useContext(WizardContextId)
    return <>
      <h1 {...props}>
        <Slot />
      </h1>
      <Slot name='sub-title' />
    </>
  })

  export type WizardCrumbProps = { step: number } & QwikIntrinsicElements['li'];
  export const WizardCrumb = component$(({ step, ...props }: WizardCrumbProps) => {

    const ctx = useContext(WizardContextId);
    return <>
      <li {...props}
        class={step === ctx.state.current ? 'active' : ''}
      >
        <a
          onClick$={() => { ctx.onPage$(step) }}
        >
          <Slot />
        </a>
      </li>
    </>
  })
