import { JSXChildren, component$, useStylesScoped$ } from '@builder.io/qwik';
import styles from './visualizer.scss?raw';

export const VisualizeXML = component$(({ file }: { file: Document }) => {
    useStylesScoped$(styles)
    // get locale by browser or position

    // next steps
    // allow selecting of the elements and mapping them to a movement
    // Which is the date - parse the date
    // which is the value - parse the value
    // which is the type - credit / debit
    // which is the description (allow multiple)
    // which is the receiving account

    // get the browser locale

    return <div><div>Locale: {getLocale('en-us')}</div>{visualizeFirstUniqueTagName(file)}</div>
})

export function visualizeFirstUniqueTagName(document: Document): JSXChildren {
    const uniqueTagNames: Set<string> = new Set();

    // Recursive function to traverse the DOM tree
    function traverseDOM(element: Element, level: number): JSXChildren {
        const tagName = element.tagName;
        if (level > 2) return;

        if (!uniqueTagNames.has(tagName)) {
            uniqueTagNames.add(tagName);
            const text = element.firstChild?.nodeName.includes('text') ? element.firstChild.textContent : '';
            console.log(text);

            return <div class={`level-${level} highlight`} >{
                Number(element.children?.length) > 0
                    ? <>
                        <span>{`<${tagName}>${text}`}</span> {
                            Array.from(element.children).map(c => traverseDOM(c, level + 1))
                        } <span>{`</${tagName}>`}</span></>
                    : `<${tagName}>${text}</${tagName}>`
            }</div>
        }

        return undefined;
    }

    // Start traversal from the document root
    const res = traverseDOM(document.documentElement, 0);
    return res!;
}
