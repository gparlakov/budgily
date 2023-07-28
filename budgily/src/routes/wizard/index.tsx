import { Component, QwikIntrinsicElements, Slot, component$, useComputed$, useSignal } from '@builder.io/qwik';
import { Pagination } from '@qwik-ui/tailwind';


export const Page1 = component$((props: QwikIntrinsicElements['div']) => <div {...props}>page111</div>);
export const Page2 = component$((props: QwikIntrinsicElements['div']) => <div {...props}>page211</div>);


export default component$(() => {

  const current = useSignal(1);
  return <>

    <Pagination
      pages={2}
      page={current.value}
      onPaging$={(p: number) => {
        current.value = p;
      }}
    />
    <div>c:{current.value}</div>

    <Wizard
      steps={[WizardStep, Page2]}
      current={current.value - 1}
    />
  </>
});


export type WizardProps = {
  steps: Array<Component<QwikIntrinsicElements['div']>>,
  current?: number;
}

const Wizard = component$(({ steps, current }: WizardProps) => {

  console.log('rendering', current, steps)
  const hasCrumbs = true; // childrens.filter(c => typeof c === 'string' && /slot=['"]crumb/.test(c));
  // const currentFromProps = steps.findIndex(s => s.current);
  const c = useSignal<number>(current ?? 0);

  const Step = steps.find((s, i) => i === current) ?? steps[0];

  return <div class="hero min-h-screen w-full bg-base-200">
    <div class="hero-content w-full">

      <div class="w-full">
        {hasCrumbs && <div class="text-sm breadcrumbs">
          <ul>
            {/* {steps
              .filter((s, i) => i <= current.value)
              .map((s, i) =>
                <li class={i === current.value ? 'active' : ''}><a onClick$={() => { current.value = i }}>{s.crumbTitle}</a></li>
              )} */}
            <Slot name="crumbs" />
          </ul>
        </div>}
        <div class="text-center">
          <Slot name="title" />
          {/* <h1 class="text-5xl font-bold">{currentStep.value.title}</h1>
           {currentStep.value.subTitle && <p class="text-2x py-6">currentStep.value.subTitle</p>}
          </div> */}
          <div class="card w-full shadow-2xl bg-base-100">
            <div class="card-body">
              <Step key={current}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

})


export const WizardStep = component$((props: QwikIntrinsicElements['div']) => {

  return <div {...props}>
    <Slot />
  </div>
})

export const WizardStepCrumb = component$((props: QwikIntrinsicElements['li']) => {

  return <li {...props}>
    <Slot />
  </li>
})

export const WizardStepTitle = component$((props: QwikIntrinsicElements['h1']) => {

  return <h1 {...props}>
    <Slot />
  </h1>
})

export const WizardStepBody = component$((props: QwikIntrinsicElements['h1']) => {

  return <h1 {...props}>
    <Slot />
  </h1>
})
