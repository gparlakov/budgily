import { JSXChildren, component$ } from '@builder.io/qwik';

export const VisualizeXML = component$(({ file }: { file: Document }) => {
    return <div>{visualizeFirstUniqueTagName(file)}</div>
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

            return <div class={`level-${level}`}>{
                Number(element.children?.length) > 0
                    ? <>
                        <span>{`<${tagName}>${text}`}</span> {
                            Array.from(element.children).map(c => traverseDOM(c, level + 1))
                        } <span>{`</${tagName}>`}</span></>
                    : `<${tagName}>${text}</${tagName}>`
            }</div>
        }

        return undefined


    }

    // Start traversal from the document root
    const res = traverseDOM(document.documentElement, 0);
    return res!;
}
