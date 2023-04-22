import { XMLParser } from 'fast-xml-parser';

export async function getXmls<T>(url: string): Promise<T | undefined> {
  console.log('FETCH, ', url);
  return fetch(url)
    .then((response) => response.text())
    .then((str) => {
      const parser = new XMLParser();
      return parser.parse(str);
    })
    .catch((e) => console.log('----error', e));
}
