import { QRL, component$ } from '@builder.io/qwik';
import { DocumentSignature } from 'budgily/src/core/xml/document-signature';
import { VisualizeXML } from './visualizer';

export interface SelectOneProps {
    file: Document;
    signature: DocumentSignature;
    selectedTag: string;
    onSelected$: QRL<(s: string, parserId: string) => void>
}
export const SelectOne = component$((props: SelectOneProps) => {
    if (props.signature == null) {
        return <></>;
    }
    const detected = props.signature.probableMovementTag

    return <VisualizeXML first={1} {...props}>
        {
            Object.entries(props.signature.tagsMap)
                .map(([tag]) =>
                    <button
                        class={`btn btn-xs ${tag === detected ? 'btn-success btn-sm' : 'btn-faded'} `}
                        onClick$={() => props.onSelected$(tag)}
                        q: slot={tag}>{
                            tag === detected ? 'Yes' : 'This is it'
                        }</ button>
                )
        }
    </VisualizeXML>
})
