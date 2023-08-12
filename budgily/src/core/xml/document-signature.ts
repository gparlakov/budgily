type TagsMap = Record<string, { parent?: string, children?: string[], level: number }>;

export interface DocumentSignature {
    tagNameCounts: Record<string, number>;
    tagsMap: TagsMap
    probableMovementTag?: string;
}
export function getXmlDocumentSignature(d: Document): DocumentSignature {
    const counts: Record<string, number> = {};
    const tagsMap: TagsMap = {};

    // Recursive function to traverse the DOM tree
    function traverseDOM(element: Element, level: number) {
        const tagName = element.tagName;
        if (!tagsMap[tagName]) {
            tagsMap[tagName] = { level, parent: element.parentElement?.tagName, children: [...element.children].map(c => c.tagName) }
        } else {
            // get unique child tag names and add them
            tagsMap[tagName].children = [...new Set([...(tagsMap[tagName].children ?? []), ...[...element.children].map(c => c.tagName)])]
        }
        counts[tagName] = counts[tagName] ? counts[tagName] + 1 : 1;

        Array.from(element.children).forEach(c => traverseDOM(c, level+1));
    }

    // Start traversal from the document root
    traverseDOM(d.documentElement, 0);

    const maxCount = Object.values(counts).sort((a, b) => b - a);
    const [firstElementWithMaxCount] = Object.entries(counts).find(([k, count]) => count === maxCount[0]) ?? []

    return {
        tagNameCounts: counts,
        tagsMap,
        probableMovementTag: firstElementWithMaxCount
    };
}
