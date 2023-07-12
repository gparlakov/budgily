import { Category } from '@codedoc1/budgily-data';
import { writeFile } from 'node:fs/promises';
import { categoriesFileName } from './categories.types';


export function storeCats(cats: Category[]) {

  // fire and forget write file - could break the file but
  return writeFile(categoriesFileName, JSON.stringify(cats));
}
