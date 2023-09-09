import {
    $,
    QRL,
    QwikIntrinsicElements,
    Slot,
    component$,
    createContextId,
    useContext,
    useContextProvider,
    useStore,
    useTask$
} from '@builder.io/qwik';

export const slot = Object.freeze({
    crumb: (s: number) => `crumb-${s}`,
    title: (s: number) => `title-${s}`,
    step: (s: number) => `step-${s}`
});

export function next() {
    const counter: Record<keyof typeof slot, number> = {
        crumb: 0,
        title: 0,
        step: 0
    }
    function n(type: keyof typeof slot) {
        const i = counter[type];
        const res = { 'q:slot': slot[type](i), step: i }
        counter[type] += 1;
        return res;
    }
    return {
        crumb: () => n('crumb'),
        title: () => n('title'),
        step: () => n('step'),
    }
}

export type WizardContext = {
    onPage$: QRL<(id: number) => void>;
    state: {
        current: number,
        nextDisabled?: boolean;
        prevDisabled?: boolean;
    },
    next$: QRL<() => void>,
    prev$: QRL<() => void>,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noop$ = $((v?: unknown) => { return; });
export const emptyContext: WizardContext = {
    onPage$: noop$,
    state: {
        current: 0,
    },
    next$: noop$,
    prev$: noop$,
}

export const WizardContextId = createContextId<WizardContext>('Wizard_context');

interface WizardProps {
    steps: number;
    useCustomActions?: boolean;
    referenceWizardContext?: WizardContext
}

export const WizardV2 = component$(({ steps: stepCount, referenceWizardContext, useCustomActions }: WizardProps) => {
    const steps = Array.from({ length: stepCount }).map((_, i) => i);
    const w = useStore({
        current: 0,
        nextDisabled: false,
        prevDisabled: true
    });

    const wiz = {
        state: w,
        next$: $(() => {
            const hasNext = w.current + 1 <= stepCount;
            if (hasNext) {
                w.prevDisabled = false;
                w.current = w.current + 1;
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
    useTask$(() => {
        if (referenceWizardContext) {
            referenceWizardContext.next$ = wiz.next$;
            referenceWizardContext.prev$ = wiz.prev$;
            referenceWizardContext.onPage$ = wiz.onPage$;
            referenceWizardContext.state = wiz.state;
        }
    })
    return (<>
        <div class="hero min-h-screen w-full bg-base-200">
            <div class="hero-content w-full">
                <div class="w-full">
                    <div class="text-sm breadcrumbs">
                        <ul>
                            {steps.map((i) => <Slot key={i} name={slot.crumb(i)} />)}
                        </ul>
                    </div>
                    <div class="text-center">
                        {steps.map((i) => <Slot key={`title-${i}`} name={slot.title(i)} />)}
                        <div class="card w-full shadow-2xl bg-base-100 items-center">
                            <div class="card-body">
                                {steps.map((i) => <Slot key={`step-${i}`} name={slot.step(i)} />)}
                            </div>

                            <div class="card-actions">
                                <Slot name="custom-actions" />

                                {!useCustomActions && <>
                                    <button
                                        class="btn-secondary"
                                        onClick$={wiz.prev$}
                                        disabled={w.prevDisabled}
                                    >Prev</button>

                                    <button
                                        class="btn-primary"
                                        onClick$={wiz.next$}
                                        disabled={w.nextDisabled}
                                    >Next</button>
                                </>}
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
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
        {ctx.state.current === step ? <>
            <h1 {...props}>
                <Slot />
            </h1>
            <Slot name='sub-title' />
        </> : ''}
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
