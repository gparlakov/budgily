import { JSXChildren, NoSerialize, QwikIntrinsicElements, Slot, component$, useSignal, useStylesScoped$ } from '@builder.io/qwik';
import { DocumentSignature } from '../../core/xml/document-signature';

import styles from './visualizer.scss?inline';

import { clsq } from '../../core/clqs';


export type VisualizerXMLProps = {
    file: Document;
    signature: DocumentSignature;
    skip?: number;
    first?: number;

    textWrapper?: { highlightClass?: string, tagClasses?: Record<string, string> } & QwikIntrinsicElements['div'];
    onClick?: NoSerialize<(tagName: string, level: number) => void>
} & QwikIntrinsicElements['div'];

export const VisualizeXML = component$(({ file, signature, skip, first, textWrapper, onClick, class: classList, ...rest }: VisualizerXMLProps) => {
    useStylesScoped$(styles)
    if (signature == null) {
        return <></>;
    }
    // allow users to style textWrapper
    const { class: classes, highlightClass, tagClasses, ...restTextWrapper } = textWrapper ?? { class: '' };
    const highlight = highlightClass ?? 'highlight';

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
                : <>
                    {!slotAdded[`${tagName}-before`] && (slotAdded[`${tagName}-before`] = true, <Slot name={`${tagName}-before`} />)}
                    <div {...restTextWrapper} class={`level level-${level} level-${level}-wrapper tag-${tagName} ${clsq(classes)} ${tagClasses?.[tagName] ?? ''}`} data-level={level} data-tag={tagName} >{
                        Number(element.children?.length) > 0
                            ? <>
                                <span>{`<${tagName}>${text}`}</span> {!slotAdded[tagName] && (slotAdded[tagName] = true, <Slot name={tagName} />)} {
                                    Array.from(element.children).map(c => traverseDOM(c, level + 1))
                                } <span>{`</${tagName}>`}</span>
                            </>
                            : <>{`<${tagName}>${text}</${tagName}>`}{!slotAdded[tagName] && (slotAdded[tagName] = true, <Slot name={tagName} />)}</>
                    }</div>
                </>
        }

        return undefined;
    }

    const currentHoverTarget = useSignal<Element>();
    // Start traversal from the document root
    return <div class={`main-wrapper ${clsq(classList)}`} {...rest}
        onMouseMove$={({ target }) => {
            // find the first "level" parent and highlight that (if not already)
            let t = target as Element;
            while (!t.classList.contains('level') && t.parentElement != null) {
                t = t.parentElement;
            }
            if (t === currentHoverTarget.value) {
                return;
            }

            [...document.querySelectorAll('.level')].forEach(el => {
                const isTarget = el === t;
                if (isTarget && !el.classList.contains(highlight)) {
                    el.classList.add(highlight);
                    currentHoverTarget.value = el;
                } else {
                    el.classList.remove(highlight);
                }
            })
        }}
        onClick$={({ target }) => {
            if (typeof onClick !== 'function') {
                return;
            }
            // find the first "level" parent and highlight that (if not already)
            let t = target as HTMLElement;
            while (!t.classList.contains('level') && t.parentElement != null) {
                t = t.parentElement as HTMLElement;
            }

            const tag = t.attributes.getNamedItem('data-tag')?.value ?? ''
            const level = parseInt(t.attributes.getNamedItem('data-level')?.value ?? '0')

            onClick(tag, level);
        }}
    >{traverseDOM(file.documentElement, 0)}</div>;
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


