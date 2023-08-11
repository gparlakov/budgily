import { JSXChildren, QRL, QwikIntrinsicElements, Slot, component$, useSignal, useStylesScoped$ } from '@builder.io/qwik';
import { DocumentSignature } from './document-signature';
import { Parsed } from './reader';

import styles from './visualizer.scss?inline';
import selectTransactionStyles from './select-transaction.scss?inline';
import { clsq } from 'budgily/src/core/clqs';

export interface SelectTransactionProps {
    file: Document;
    signature: DocumentSignature;
    onSelected$: QRL<(s: string) => void>
}
export const SelectTransaction = component$((props: SelectTransactionProps) => {
    useStylesScoped$(selectTransactionStyles);
    if (props.signature == null) {
        return <></>;
    }
    const detected = props.signature.probableMovementTag

    return <VisualizeXML first={3} {...props}>
        {Object.entries(props.signature?.tagsMap ?? {}).map(([tag]) =>
            <button
                class={`btn btn-xs ${tag === detected ? 'btn-success btn-sm' : 'btn-faded'} `}
                onClick$={() => props.onSelected$(tag)}
                q: slot={tag}>{
                    tag === detected ? 'Yes' : 'This is it'
                }</button>)}
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

export interface SelectedLocaleProps {
    file: Document;
    recognized: Record<string, Parsed>;
    signature: DocumentSignature;
}
export const SelectedLocale = component$(({ recognized, ...rest }: SelectedLocaleProps) => {
    useStylesScoped$(selectTransactionStyles);

    return <VisualizeXML first={1} {...rest}>
        {Object.entries(recognized).map(([tag, p]) => {
            switch (p.type) {
                case 'amount':
                    return <div q: slot={tag}>{p.value}</div>
                case 'date':
                    return <div q: slot={tag}>{p.value.toLocaleDateString()}</div>
                default:
                    return '';
            }
        })

        }
    </VisualizeXML>
})

interface VisualizerXMLProps {
    file: Document;
    signature: DocumentSignature;
    skip?: number;
    first?: number;

    textWrapper?: QwikIntrinsicElements['div'];
}

export const VisualizeXML = component$(({ file, signature, skip, first, textWrapper }: VisualizerXMLProps) => {
    useStylesScoped$(styles)
    if (signature == null) {
        return <></>;
    }
    // allow users to style textWrapper
    const { class:classes, ...restTextWrapper } = textWrapper ?? { class: '' };

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
                : <div {...restTextWrapper} class={`level level-${level} level-${level}-wrapper ${clsq(classes)}`} >{
                    Number(element.children?.length) > 0
                        ? <>
                            <span>{`<${tagName}>${text}`}</span> {!slotAdded[tagName] && (slotAdded[tagName] = true, <Slot name={tagName} />)} {
                                Array.from(element.children).map(c => traverseDOM(c, level + 1))
                            } <span>{`</${tagName}>`}</span>
                        </>
                        : <>{`<${tagName}>${text}</${tagName}>`}{!slotAdded[tagName] && (slotAdded[tagName] = true, <Slot name={tagName} />)}</>
                }</div>
        }

        return undefined;
    }

    const c = useSignal<Element>();
    // Start traversal from the document root
    return <div class="main-wrapper" onMouseMove$={({target}) => {
        // find the first "level" parent and highlight that (if not already)
        let t = target as Element;
        while (!t.classList.contains('level') && t.parentElement != null) {
            t = t.parentElement;
        }
        if(t === c.value) {
            return;
        }

        [...document.querySelectorAll('.level')].forEach(el => {
            const isTarget = el === t;
            if(isTarget && !el.classList.contains('highlight')) {
                el.classList.add('highlight');
                c.value = el;
            } else {
                el.classList.remove('highlight');
            }
        })
    }}>{traverseDOM(file.documentElement, 0)}</div>;
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


