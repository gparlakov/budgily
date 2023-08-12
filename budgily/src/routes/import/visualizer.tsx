import { JSXChildren, NoSerialize, QRL, QwikIntrinsicElements, Slot, component$, noSerialize, useSignal, useStyles$, useStylesScoped$ } from '@builder.io/qwik';
import { DocumentSignature } from './document-signature';
import { Parsed } from './reader';

import styles from './visualizer.scss?inline';
import selectTransaction from './select-transaction.scss?inline';

import { clsq } from 'budgily/src/core/clqs';
import { Button } from '@qwik-ui/tailwind';

export interface SelectTransactionProps {
    file: Document;
    signature: DocumentSignature;
    onSelected$: QRL<(s: string) => void>
}
export const SelectTransaction = component$((props: SelectTransactionProps) => {
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

    useStylesScoped$(selectTransaction);

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

export interface SelectedLocaleProps {
    file: Document;
    recognized: Record<string, Parsed>;
    signature: DocumentSignature;
}
export const SelectedLocale = component$(({ recognized, ...rest }: SelectedLocaleProps) => {

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
                : <div {...restTextWrapper} class={`level level-${level} level-${level}-wrapper tag-${tagName} ${clsq(classes)} ${tagClasses?.[tagName] ?? ''}`} data-level={level} data-tag={tagName} >{
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


