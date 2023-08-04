import { component$, useSignal, $, useStore } from '@builder.io/qwik';
import { WizardV2, WizardTitle, WizardCrumb, WizardStep, WizardContext } from 'budgily/src/components/wizard/wizard.v2';


export default component$(() => {
    const w = useStore<{ctx?: WizardContext}>({})
    return <>
        <WizardV2
            steps={2}
            onWizardContext={w}
            useCustomActions={true}
        >
            <WizardCrumb q: slot="crumb0" step={0}> Crumb1</WizardCrumb>
            <WizardTitle q: slot="title-0" step={0}> First title</WizardTitle>
            <WizardStep q: slot="step-0" step={0} >First Step</WizardStep>


            <WizardCrumb q: slot="crumb1" step={1}> Crumb2</WizardCrumb>
            <WizardTitle q: slot="title-1" step={1}> title2</WizardTitle>
            <WizardStep q: slot="step-1" step={1} >Step 2</WizardStep>

            <>
                <button q: slot="custom-actions" onClick$={() => w.ctx?.prev$()}>prev</button>
                <button q: slot="custom-actions" onClick$={() => w.ctx?.next$()}>next</button>
            </>
        </WizardV2>
    </>
});
