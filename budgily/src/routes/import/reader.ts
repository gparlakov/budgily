export async function readAndParseFiles(input: HTMLInputElement): Promise<Document[]> {
  const files: FileList | null = input.files;
  if (!files || files.length === 0) {
    console.log('No files selected.');
    return [];
  }

  return Promise.all(
    Array.from(files).map((f) =>
      f.text().then((text) => {
        const parser: DOMParser = new DOMParser();
        return parser.parseFromString(text, 'application/xml');
      })
    )
  );
}


export function visualizeFirstUniqueTagName(document: Document): void {
  const uniqueTagNames: Set<string> = new Set();

  // Recursive function to traverse the DOM tree
  function traverseDOM(element: Element): void {
    const tagName = element.tagName;
    if (!uniqueTagNames.has(tagName)) {
      // element('style', 'border: 2px solid red');
      uniqueTagNames.add(tagName);
      // Continue traversing child elements
      const children = element.children;
      for (let i = 0; i < children.length; i++) {
        traverseDOM(children[i] as Element);
      }

    } else {
      element.setAttribute('style', 'display:none');
    }
  }

  // Start traversal from the document root
  traverseDOM(document.documentElement);
}
