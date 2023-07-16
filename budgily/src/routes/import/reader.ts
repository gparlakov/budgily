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

