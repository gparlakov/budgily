import { Button } from '@qwik-ui/tailwind';
import { QRL, component$, noSerialize, useStyles$, useStylesScoped$ } from '@builder.io/qwik';

import { DocumentSignature } from '../../core/xml/document-signature';

import { VisualizeXML } from './visualizer';

import styles from './select-movement.scss?inline';
import { TwoColumns } from '../two-columns/two-columns';

export interface SelectMovementProps {
    file: Document;
    signature: DocumentSignature;
    onSelected$: QRL<(s: string) => void>
}
export const SelectMovement = component$((props: SelectMovementProps) => {
    useStyles$(`
        .highlight {
            position: relative;
        }
        .highlight.hovering>.visible-when-hover{
            display: block;
            position: absolute;
            width: 100%;
            height: 100%;
            left:0;
            right: 0;
            top: 0;
            bottom: 0;
        }

        .probable-movement {
            position: relative;
        }
`);

    useStylesScoped$(styles);

    if (props.signature == null) {
        return <></>;
    }

    const detected = props.signature.probableMovementTag ?? '';

    return <TwoColumns >

        <span q:slot="left-title">Is this it?</span>
        <div class="mb-4" q:slot="left-description">We've outlined what we detected to be the most probable one movement part.</div>
        <div class="mb-4" q:slot="left-description">Did we get it right?</div>
        <div class="mb-4" q:slot="left-description"> Confirm or select one movement →</div>

        <Button class="pop-up" onClick$={() => props.onSelected$(detected)} q:slot="left-action">Yes</Button>

        <VisualizeXML q:slot="right" class="xml-content" first={3} {...props}
            textWrapper={{ class: 'hovering', tagClasses: { [detected ?? '']: 'probable-movement' } }}
            onClick={noSerialize((tag) => { props.onSelected$(tag) })}>
            {
                Object.entries(props.signature?.tagsMap ?? {})
                    .map(
                        ([tag]) => <div key={`select-${tag}`} q:slot={tag}>
                            <div class="visible-when-hover" >
                                <img src="/checkmark.svg" class="yes-this-is-it" />
                            </div>
                            {tag === detected && <div class="detected-probable-movement"></div>}
                        </div>
                    )
            }
        </VisualizeXML>
    </TwoColumns >
})
