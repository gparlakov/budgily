import { readFile, stat } from 'node:fs/promises';
import { categoriesFileName } from './categories.types';
import { Category } from '@codedoc1/budgily-data';

let retriesDefault = 1;
export function readCats(retries = retriesDefault): Promise<Category[]> {

  return stat(categoriesFileName)
    .then(
      (v) => v.isFile(),
      () => false
    )
    .then((exists) => (exists ? readFile(categoriesFileName) : Buffer.from('[]')))
    .then((b) => JSON.parse(b.toString()) as Category[])
    .catch((e) => {
      console.log('---error while reading categories', e);
      if(retries > 0) {
        return readCats(retries - 1)
      } else {
        return [];
      }
    });
}
