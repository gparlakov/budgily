import { component$ } from '@builder.io/qwik';
import { WizardV2, WizardTitle } from 'budgily/src/components/wizard/wizard.v2';


export default component$(() => {

    return <>
      <WizardV2
        steps={3}
      >
        {/* <WizardCrumb q: slot="crumb0" step={0}> Crumb1</WizardCrumb> */}
        <WizardTitle q: slot="title-0"> First title</WizardTitle>
        {/* <WizardStep id={1} q: slot="step-0">First Step</WizardStep> */}


        {/* <WizardCrumb q: slot="crumb1" step={1}> Crumb2</WizardCrumb> */}
        <WizardTitle q: slot="title-1"> title2</WizardTitle>
        {/* <WizardStep id={2} q: slot="step-1">Step 2</WizardStep> */}
      </WizardV2>
    </>
  });
