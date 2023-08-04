import {
    $,
    QRL,
    QwikIntrinsicElements,
    Slot,
    component$,
    createContextId,
    useContext,
    useContextProvider,
    useStore
} from '@builder.io/qwik';


export type WizardContext = {
    onPage$: QRL<(id: number) => void>;
    state: {
        current: number
    },
    next$: QRL<() => void>,
    prev$: QRL<() => void>,
}

export const WizardContextId = createContextId<WizardContext>('Wizard_context');

interface WizardProps {
    steps: number;
    useCustomActions?: boolean;
    onWizardContext?: { ctx?: WizardContext }
}

export const WizardV2 = component$(({ steps: stepCount, onWizardContext, useCustomActions }: WizardProps) => {
    const steps = Array.from({ length: stepCount }).map((_, i) => i);
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
    if (onWizardContext) {
        onWizardContext.ctx = wiz;
    }
    return (<>
        <div class="hero min-h-screen w-full bg-base-200">
            <div class="hero-content w-full">
                <div class="w-full">
                    <div class="text-sm breadcrumbs">
                        <ul>
                            {
                                steps
                                    .map((s) => <Slot key={s} name={`crumb${s}`} />)
                            }
                        </ul>
                    </div>
                    <div class="text-center">
                        {
                            steps
                                .map((i) => <Slot key={`title-${i}`} name={`title-${i}`} />)
                        }
                        <div class="card w-full shadow-2xl bg-base-100 items-center">
                            <div class="card-body">

                                {
                                    steps
                                        .map((i) => <Slot key={`step-${i}`} name={`step-${i}`} />)
                                }

                            </div>

                            <div class="card-actions">
                                <Slot name="custom-actions" />

                                {!useCustomActions && <><button
                                    class="btn-secondary"
                                    onClick$={wiz.prev$}
                                    disabled={w.prevDisabled}
                                >Prev</button>

                                    <button
                                        class="btn-primary"
                                        onClick$={wiz.next$}
                                        disabled={w.nextDisabled}
                                    >Next</button></>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>)
})


export type WizardStepProps = {
    step: number
}
export const WizardStep = component$(({ step }: WizardStepProps) => {
    const ctx = useContext(WizardContextId)
    return <>
        {ctx.state.current === step ? <Slot /> : ''}
    </>
})

export type WizardTitleProps = { step: number } & QwikIntrinsicElements['h1'];
export const WizardTitle = component$(({ step, ...props }: WizardTitleProps) => {
    const ctx = useContext(WizardContextId)
    return <>
        {ctx.state.current === step ? <><h1 {...props}>
            <Slot />
        </h1>
            <Slot name='sub-title' /> </> : ''}
    </>
})

export type WizardCrumbProps = { step: number } & QwikIntrinsicElements['li'];
export const WizardCrumb = component$(({ step, ...props }: WizardCrumbProps) => {

    const ctx = useContext(WizardContextId);
    return <>
        {ctx.state.current >= step ? <li {...props}
            class={step === ctx.state.current ? 'active' : ''}
        >
            <a
                onClick$={() => { ctx.onPage$(step) }}
            >
                <Slot />
            </a>
        </li> : ''}
    </>
})
