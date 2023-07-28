import { component$ } from '@builder.io/qwik';
import { Wizard } from 'budgily/src/components/wizard/wizard';

export type WizardStepProps = { id: number };
export type WizardCrumbProps = { id: number };
export type WizardTitleProps = { id: number };

const Page = (title: string) => ({ id }: WizardStepProps) => <>{title} {id}</>

export const Page1 = component$(Page('1111'));
export const Page2 = component$(Page('2222'));

const Crumb1 = component$(() => <>title 1</>)
const Crumb2 = component$(() => <>title 2</>)

export default component$(() => {

  return <>
    <Wizard
      crumbs={[Crumb1, Crumb2]}
      steps={[Page1, Page2]}
    />
  </>
});

