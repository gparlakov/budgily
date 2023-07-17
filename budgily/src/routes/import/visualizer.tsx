import { JSXChildren, component$, useSignal, useStore, useStylesScoped$ } from '@builder.io/qwik';
import styles from './visualizer.scss?raw';

interface VisualizerXMLProps {
    file: Document;
    signature: DocumentSignature;
    skip?: number;
    first?: number;
}

export const VisualizeXML = component$(({ file, signature, skip, first }: VisualizerXMLProps) => {
    useStylesScoped$(styles)

    const uniqueTagNames = Object.keys(signature.tagNameCounts);
    const multipleTagNames = Object.entries(signature.tagNameCounts).filter(([, value]) => value > 1).map(([k]) => k)
    const skipTags = skip && skip > 0 ? multipleTagNames.flatMap(t => {
        const s = new Array(skip)
        s.fill(t);
        return s;
    }) : []

    const tags = first && first > 0 ? uniqueTagNames.flatMap(t => {
        const s = new Array(first)
        s.fill(t);
        return s;
    }) : uniqueTagNames;

    const probableMovementTag = useSignal(signature.probableMovementTag);
    const state = useStore<{selectedTag?: string}>({});


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

            return <div class={`level-${level} highlight ${probableMovementTag.value === tagName ? 'probable' : ''}`} >{
                Number(element.children?.length) > 0
                    ? <>
                        <span>{`<${tagName}>${text}`}</span> {
                            probableMovementTag.value === tagName && <button class="btn btn-sm" onClick$={() => state.selectedTag = probableMovementTag.value = tagName}>YES</button>
                        } <button class="btn btn-sm hidden" onClick$={() => state.selectedTag = probableMovementTag.value = tagName}>This is it!</button> {
                            Array.from(element.children).map(c => traverseDOM(c, level + 1))
                        } <span>{`</${tagName}>`}</span></>
                    : `<${tagName}>${text}</${tagName}>`
            }</div>
        }

        return undefined;
    }

    // Start traversal from the document root
    return <>{traverseDOM(file.documentElement, 0)}</>;
});

type TagsMap = Record<string, { parent?: string, children?: string[] }>;

export interface DocumentSignature {
    tagNameCounts: Record<string, number>;
    tagsMap: TagsMap
    probableMovementTag?: string;
}
export function getXmlDocumentSignature(d: Document): DocumentSignature {
    const counts: Record<string, number> = {};
    const tagsMap: TagsMap = {};

    // Recursive function to traverse the DOM tree
    function traverseDOM(element: Element) {
        const tagName = element.tagName;
        if (!tagsMap[tagName]) {
            tagsMap[tagName] = { parent: element.parentElement?.tagName, children: [...element.children].map(c => c.tagName) }
        } else {
            // get unique child tag names and add them
            tagsMap[tagName].children = [...new Set([...(tagsMap[tagName].children ?? []), ...[...element.children].map(c => c.tagName)])]
        }
        counts[tagName] = counts[tagName] ? counts[tagName] + 1 : 1;

        Array.from(element.children).forEach(c => traverseDOM(c));
    }

    // Start traversal from the document root
    traverseDOM(d.documentElement);

    const maxCount = Object.values(counts).sort((a, b) => b - a);
    const [firstElementWithMaxCount] = Object.entries(counts).find(([k, count]) => count === maxCount[0]) ?? []

    return {
        tagNameCounts: counts,
        tagsMap,
        probableMovementTag: firstElementWithMaxCount
    };
}

