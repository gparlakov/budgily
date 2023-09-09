// import { Component, component$, useStore, $ } from '@builder.io/qwik';
// import { Button } from '@qwik-ui/tailwind';
// import { WizardCrumbProps, WizardStepProps, WizardTitleProps } from '../wizard/wizard.v2';

// export type WizardProps = {
//     crumbs?: Array<Component<WizardCrumbProps>>,
//     steps: Array<Component<WizardStepProps>>,
//     titles?: Array<Component<WizardStepProps>>,
//     current?: number;
// }

// const defaultCrumb = component$(({ id }: WizardCrumbProps) => <>Step {id}</>);
// const defaultTitle = component$(({ id }: WizardCrumbProps) => <>Step {id}</>);

// export const Wizard = component$(({ steps, current, crumbs: maybeCrumbs, titles: maybeTitles }: WizardProps) => {

//     const crumbs = steps
//         .map((s, i) => Array.isArray(maybeCrumbs) ? maybeCrumbs[i] ?? defaultCrumb : defaultCrumb);

//     const titles = steps.map((s, i) => maybeTitles ? maybeTitles[i] ?? defaultTitle : defaultTitle)
//     const c = useStore<{
//         current: number,
//         Step: Component<WizardStepProps>
//         Title: Component<WizardTitleProps>
//     }>(() => {
//         const cur = current ?? 1;
//         return {
//             current: cur,
//             Step: steps[cur - 1],
//             Title: titles[cur - 1],
//         }
//     });

//     const onPage = $((p: number) => {
//         c.current = p;
//         c.Step = steps[p - 1] ?? c.Step;
//         c.Title = titles[p - 1] ?? c.Title;
//     });

//     return <>
//         <div class="hero min-h-screen w-full bg-base-200">
//             <div class="hero-content w-full">
//                 <div class="w-full">
//                     <div class="text-sm breadcrumbs">
//                         <ul>
//                             {crumbs
//                                 .filter((_, i) => i < c.current)
//                                 .map((Crumb, i) => {
//                                     return <li class={i === c.current ? 'active' : ''}>
//                                         <a onClick$={() => { onPage(i + 1) }}>
//                                             <Crumb id={i} />
//                                         </a>
//                                     </li>
//                                 })}
//                         </ul>
//                     </div>
//                     <div class="text-center">
//                         <c.Title id={c.current} />
//                         <div class="card w-full shadow-2xl bg-base-100 items-center">
//                             <div class="card-body">
//                                 <c.Step id={c.current} />
//                             </div>

//                             <div class="card-actions">
//                                 <Button
//                                     class="btn-secondary"
//                                     onClick$={() => onPage(c.current - 1)}
//                                     disabled={steps[c.current - 2] == null}
//                                 >Prev</Button>
//                                 <Button
//                                     class="btn-primary"
//                                     onClick$={() => onPage(c.current + 1)}
//                                     disabled={steps[c.current] == null}
//                                 >Next</Button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </>

// })
