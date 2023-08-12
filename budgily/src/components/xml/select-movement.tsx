import { Button } from '@qwik-ui/tailwind';
import { QRL, component$, noSerialize, useStyles$, useStylesScoped$ } from '@builder.io/qwik';

import { DocumentSignature } from '../../core/xml/document-signature';

import { VisualizeXML } from './visualizer';

import styles from './select-movement.scss?inline';

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

    return <div class="wrap">
        <article class="action">
            <h2 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
            >Is this it?</h2>
            <p class="mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400"
            >
                <div class="mb-4">We've outlined what we detected to be the most probable one movement part.</div>
                <div class="mb-4">Did we get it right?</div>
                <div class="mb-4"> Confirm below or select one movement on the right →</div>
            </p>
            <Button class="pop-up" onClick$={() => props.onSelected$(detected)}>Yes</Button>
        </article>
        <VisualizeXML class="xml-content" first={3} {...props}
            textWrapper={{ class: 'hovering', tagClasses: { [detected ?? '']: 'probable-movement' } }}
            onClick={noSerialize((tag) => { props.onSelected$(tag) })}>
            {
                Object.entries(props.signature?.tagsMap ?? {})
                    .map(
                        ([tag]) => <div q: slot={tag}>
                            <div class="visible-when-hover" >
                                <img src="/checkmark.svg" class="yes-this-is-it" />
                            </div>
                            {tag === detected && <div class="detected-probable-movement"></div>}
                        </div>
                    )
            }
        </VisualizeXML>
    </div>
})
