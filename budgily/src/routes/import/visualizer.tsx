import { JSXChildren, QRL, Slot, component$, useStylesScoped$ } from '@builder.io/qwik';
import { DocumentSignature } from './document-signature';
import styles from './visualizer.scss?inline';

import selectTransactionStyles from './select-transaction.scss?inline';

export interface SelectTransactionProps {
    file: Document;
    signature: DocumentSignature;
    onSelected$: QRL<(s: string) => void>
}
export const SelectTransaction = component$((props: SelectTransactionProps) => {
    useStylesScoped$(selectTransactionStyles);
    const detected = props.signature.probableMovementTag

    return <VisualizeXML first={3} {...props}>
        {Object.entries(props.signature.tagsMap).map(([tag]) => <button class={`btn btn-xs ${tag === detected ? 'btn-success btn-sm' : 'btn-faded'} `} onClick$={() => props.onSelected$(tag)} q: slot={tag}>{tag === detected ? 'Yes' : 'This is it'}</button>)}
    </VisualizeXML>
})

export interface SelectOneProps {
    file: Document;
    signature: DocumentSignature;
    selectedTag: string;
    onSelected$: QRL<(s: string, parserId: string) => void>
}
export const SelectOne = component$((props: SelectOneProps) => {
    useStylesScoped$(selectTransactionStyles);
    const detected = props.signature.probableMovementTag

    return <VisualizeXML first={1} {...props}>
        {Object.entries(props.signature.tagsMap).map(([tag]) => <button class={`btn btn-xs ${tag === detected ? 'btn-success btn-sm' : 'btn-faded'} `} onClick$={() => props.onSelected$(tag)} q: slot={tag}>{tag === detected ? 'Yes' : 'This is it'}</button>)}
    </VisualizeXML>
})

interface VisualizerXMLProps {
    file: Document;
    signature: DocumentSignature;
    skip?: number;
    first?: number;
}

export const VisualizeXML = component$(({ file, signature, skip, first }: VisualizerXMLProps) => {
    useStylesScoped$(styles)

    const { skipTags, tags } = useCalculateVisibleTags(signature, skip, first);
    const slotAdded: Record<string, boolean> = {};

    // Recursive function to traverse the DOM tree
    function traverseDOM(element: Element, level: number): JSXChildren {
        const tagName = element.tagName;

        const skip = skipTags.findIndex(t => t === tagName);
        let skipThisTag = false;
        if (skip >= 0) {
            skipThisTag = true;
            skipTags.splice(skip, 1);
        }

        const t = tags.findIndex(t => t === tagName);
        if (t >= 0) {
            if (!skipThisTag) {
                tags.splice(t, 1); // don't render this element any more
            }
            const text = element.firstChild?.nodeName.includes('text') ? element.firstChild.textContent : '';

            return skipThisTag
                ? <>{Array.from(element.children).map(c => traverseDOM(c, level + 1))}</>
                : <div class={`level-${level} highlight`} >{
                    Number(element.children?.length) > 0
                        ? <>
                            <span>{`<${tagName}>${text}`}</span> { !slotAdded[tagName] && (slotAdded[tagName] = true, <Slot name={tagName} />) } {
                                Array.from(element.children).map(c => traverseDOM(c, level + 1))
                            } <span>{`</${tagName}>`} </span></>
                        : <>{`<${tagName}>${text}</${tagName}>`}{ !slotAdded[tagName] && (slotAdded[tagName] = true, <Slot name={tagName} />)}</>
                }</div>
        }

        return undefined;
    }

    // Start traversal from the document root
    return <>{traverseDOM(file.documentElement, 0)}</>;
});

function useCalculateVisibleTags(signature: DocumentSignature, skip: number | undefined, first: number | undefined) {
    const uniqueTagNames = Object.keys(signature.tagNameCounts);
    const multipleTagNames = Object.entries(signature.tagNameCounts).filter(([, value]) => value > 1).map(([k]) => k);
    console.log('multipleTagNames', signature.tagNameCounts)
    const skipTags = skip && skip > 0 ? multipleTagNames.flatMap(t => {
        const s = new Array(skip);
        s.fill(t);
        return s;
    }) : [];

    const tags = first && first > 0 ? uniqueTagNames.flatMap(t => {
        const s = new Array(first);
        s.fill(t);
        return s;
    }) : uniqueTagNames;
    return { skipTags, tags };
}


