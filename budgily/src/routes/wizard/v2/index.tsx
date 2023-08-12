import { component$, useStore } from '@builder.io/qwik';
import { WizardContext, WizardCrumb, WizardStep, WizardTitle, WizardV2, emptyContext, next } from 'budgily/src/components/wizard/wizard.v2';


export default component$(() => {
    const w = useStore<WizardContext>(emptyContext)
    const {crumb, title, step} = next();
    return <>
        <WizardV2
            steps={5}
            referenceWizardContext={w}
            useCustomActions={true}
        >
            <WizardCrumb {...crumb()}> Crumb1</WizardCrumb>
            <WizardTitle {...title()}> First title</WizardTitle>
            <WizardStep {...step()} >First Step</WizardStep>

            <WizardCrumb {...crumb()}> Crumb2</WizardCrumb>
            <WizardTitle {...title()}> title2</WizardTitle>
            <WizardStep {...step()} >Step 2</WizardStep>

            <WizardCrumb {...crumb()}> Crumb3</WizardCrumb>
            <WizardTitle {...title()}> title3</WizardTitle>
            <WizardStep {...step()} >Step 3</WizardStep>

            <WizardCrumb {...crumb()}> Crumb4</WizardCrumb>
            <WizardTitle {...title()}> title4</WizardTitle>
            <WizardStep {...step()} >Step 4</WizardStep>

            <WizardCrumb {...crumb()}> Crumb5</WizardCrumb>
            <WizardTitle {...title()}> title5</WizardTitle>
            <WizardStep {...step()} >Step 5</WizardStep>

            <>
                <button q: slot="custom-actions" onClick$={() => w.prev$()} disabled={w.state.prevDisabled}>prev</button>
                <button q: slot="custom-actions" onClick$={() => w.next$()} disabled={w.state.nextDisabled}>next</button>
            </>
        </WizardV2>
    </>
});
