import { DateParser } from 'budgily/src/core/date-parser';
import { NumberParser } from 'budgily/src/core/number-parser';

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

export type Parsed =
  | {
      type: 'amount';
      value: number;
    }
  | {
      type: 'date';
      value: Date;
    }
  | {
      type: 'description';
      value: string;
    }
  | {
      type: 'unknown';
    };

export function getProbableParsed(element: Element, locale: string): Record<string, Parsed> {
  const date = new DateParser(locale);
  const num = new NumberParser(locale);

  const texts = [...element.children].map((e) => ({
    tag: e.tagName,
    length: e.textContent?.length ?? 0,
    text: e.textContent ?? '',
  }));
  const description = texts.sort((a, b) => Number(b.length) - Number(a.length))[0].tag;

  return texts.reduce((acc, { tag, text }) => {
    if (tag === description) {
      return { ...acc, [tag]: { type: 'description', value: text } };
    }
    const isNumber = !isNaN(num.parse(text));
    const isDate = date.parse(text) != undefined;

    return {
      ...acc,
      [tag]: <Parsed>{
        type: isNumber ? 'amount' : isDate ? 'date' : 'unknown',
        value: isNumber ? num.parse(text) : isDate ? date.parse(text) : undefined,
      },
    };
  }, {} as Record<string, Parsed>);
}
