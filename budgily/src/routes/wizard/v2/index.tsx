import { component$, useStore } from '@builder.io/qwik';
import { WizardContext, WizardCrumb, WizardStep, WizardTitle, WizardV2, emptyContext, next } from 'budgily/src/components/wizard/wizard.v2';


export default component$(() => {
    const w = useStore<WizardContext>(emptyContext)
    return <>
        <WizardV2
            steps={2}
            referenceWizardContext={w}
            useCustomActions={true}
        >
            <WizardCrumb {...next('crumb')}> Crumb1</WizardCrumb>
            <WizardTitle {...next('title')}> First title</WizardTitle>
            <WizardStep {...next('step')} >First Step</WizardStep>

            <WizardCrumb {...next('crumb')}> Crumb2</WizardCrumb>
            <WizardTitle {...next('title')}> title2</WizardTitle>
            <WizardStep {...next('step')} >Step 2</WizardStep>

            <>
                <button q: slot="custom-actions" onClick$={() => w.prev$()} disabled={w.state.prevDisabled}>prev</button>
                <button q: slot="custom-actions" onClick$={() => w.next$()} disabled={w.state.nextDisabled}>next</button>
            </>
        </WizardV2>
    </>
});
