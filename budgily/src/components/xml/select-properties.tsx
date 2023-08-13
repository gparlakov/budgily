import { component$, useComputed$, useSignal } from '@builder.io/qwik';
import { DocumentSignature } from 'budgily/src/core/xml/document-signature';
import { Parsed } from 'budgily/src/core/xml/reader';
import { VisualizeXML } from './visualizer';
import { TwoColumns } from '../two-columns/two-columns';
import { Button } from '@qwik-ui/tailwind';
import { Movement } from '@codedoc1/budgily-data-client';

type Props = Exclude<Parsed['type'], 'unknown'>

export interface SelectedLocaleProps {
    file: Document;
    parsed: Record<string, Parsed>;
    signature?: DocumentSignature;
}
export const SelectProperties = component$(({ parsed, signature, ...rest }: SelectedLocaleProps) => {

    const steps: Exclude<Props, 'unknown'>[] = ['date', 'amount', 'description']
    const step = useSignal<Props>('date');
    const sI = useComputed$(() => steps.indexOf(step.value))

    const selected = useSignal<Partial<Record<keyof Movement, string>>>({});

    return <>
        {signature != null && <TwoColumns>

            <span q: slot="left-title">{step.value}</span>
            <div q: slot="left-description">{Object.entries(parsed).map(([tag, p]) => {

                const v = 'value' in p ? typeof p.value == 'object' ? p.value.toDateString() : p.value : '';
                switch (p.type) {
                    case 'unknown':
                        return <></>
                    case step.value as Props:
                        return <div class="bg-blue-100 inline-block">{v}</div>
                    default:
                        return <>{steps.indexOf(p.type) < sI.value && <div class="bg-green-50">{p.type}: {v}</div>}</>;
                }
            })
            }</div>
            <div class="mb-4" q: slot="left-description">This is what we detected to be the most probable <span class="bg-blue-100">{step.value}</span>.</div>
            <div class="mb-4" q: slot="left-description">Did we get it right?</div>
            <div class="mb-4" q: slot="left-description"> Confirm or select on the right →</div>
            <Button class="btn-success" q: slot="left-description"
                onClick$={() => {
                    const [tag] = Object.entries(parsed).find(([tag, p]) => p.type === step.value) ?? []
                    if (tag != null) {
                        selected.value = { ...selected.value, [step.value]: tag };
                    }
                    const next = steps.indexOf(step.value) + 1;
                    if (next >= steps.length) {
                        // we've selected all
                    } else {
                        step.value = steps[next];
                    }
                }}>Confirm</Button>

            <VisualizeXML q: slot="right" first={1} signature={signature} {...rest}>
                {Object.entries(parsed).map(([tag, p]) => {

                    const selectingType = p.type === step.value;

                    const selectedType = p.type != 'unknown' && selected.value[p.type];
                    return selectingType ? <span class="bg-blue-100" q: slot={tag}> ← </span>
                        : selectedType ? <span q: slot={`${selectedType}-before`} class="bg-green-50">{p.type}</span> : '';
                })}

            </VisualizeXML>
        </TwoColumns>}
    </>
})
