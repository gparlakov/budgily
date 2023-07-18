import { JSXChildren, Slot, component$, useStylesScoped$ } from '@builder.io/qwik';
import { DocumentSignature } from './document-signature';
import styles from './visualizer.scss?inline';
export interface SelectTransactionProps {
    file: Document;
    signature: DocumentSignature;
}
export const SelectTransaction = component$((props: SelectTransactionProps) => {

    const detected = props.signature.probableMovementTag

    return <VisualizeXML skip={2} first={5} {...props}>
        {Object.entries(props.signature.tagsMap).map(([tag, {level}]) => <button class="btn btn-xs" onClick$={() => {
            console.log(tag, level)
        }} q:slot={tag}>{tag === detected ? 'Yes' : 'This is it'}</button>) }
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

    // Recursive function to traverse the DOM tree
    function traverseDOM(element: Element, level: number): JSXChildren {
        const tagName = element.tagName;

        const skip = skipTags.findIndex(t => t === tagName);

        if (skip >= 0) {
            skipTags.splice(skip, 1);
            return; // skipping this element
        }

        const t = tags.findIndex(t => t === tagName);

        if (t >= 0) {
            tags.splice(t, 1); // don't render this element any more
            const text = element.firstChild?.nodeName.includes('text') ? element.firstChild.textContent : '';

            return <div class={`level-${level} highlight`} >{
                Number(element.children?.length) > 0
                    ? <>
                        <span>{`<${tagName}>${text}`}</span> <Slot name={tagName} /> {
                            Array.from(element.children).map(c => traverseDOM(c, level + 1))
                        } <span>{`</${tagName}>`} <Slot name={tagName} /></span></>
                    : `<${tagName}>${text}</${tagName}>`
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


