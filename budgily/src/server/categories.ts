import { readFile, stat, writeFile } from 'node:fs/promises';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { take, map} from 'rxjs/operators';
import { Categorize, Category, Movement } from './types';
import { max } from 'd3';

const catsFileName = process.env['BUDGILY_CATEGORIES_FILE_PATH'] ?? 'categories.json';
const categories$ = new ReplaySubject<Category[]>(1);
stat(catsFileName)
  .then(
    (v) => v.isFile(),
    () => false
  )
  .then((exists) => (exists ? readFile(catsFileName) : Buffer.from('[]')))
  .then((b) => JSON.parse(b.toString()))
  .catch((e) => {
    console.log('---error while reading categories', e);
    return [];
  })
  .then((cats) => categories$.next(cats));

export function getAllCategories(): Promise<Category[]> {
  return firstValueFrom(categories$);
}

export function getCategoriesByMovement(parent: Movement) {
  return firstValueFrom(categories$
    .pipe(
      take(1),
      map((cs) =>
        parent != null
          ? cs.filter((c) => (Array.isArray(c.movementIds) ? c.movementIds.includes(parent.id) : false))
          : cs
      )
    ));
}

export function categorize({ category, categoryId, movementIds }: Categorize) {
  if (!Array.isArray(movementIds)) {
    throw new Error(`Expected an array of movements but got ${movementIds}`);
  }
  if (typeof category === 'object' && category == null) {
    throw new Error('Expected a category but got empty (null|undefined)');
  }
  if (typeof category === 'object' && category?.name == null) {
    throw new Error('Can not create a category without a name');
  }

  return categories$
    .pipe(
      take(1),
      map((cats) => {
        if (typeof categoryId === 'number' && cats.find((c) => c.id === categoryId) == null) {
          throw new Error(
            `Could not find category with id ${categoryId}. Please create a new one or provide a correct category id`
          );
        }

        const isNewCategory = typeof category === 'object' && Array.isArray(movementIds) && category?.name != null;
        let nextId = categoryId;
        let newCats: Category[];
        if (isNewCategory) {
          nextId = (max(cats.map((c) => c.id)) ?? 0) + 1;
          newCats = [
            ...cats,
            {
              ...category,
              // next id
              id: nextId,
              // add movementIds to category (set makes for unique ids only)
              movementIds: [...new Set([...movementIds, ...movementIds])],
            },
          ];
        } else {
          nextId = categoryId;
          newCats = cats.map((c) =>
            c.id === categoryId ? { ...c, movementIds: [...new Set([...c.movementIds, ...movementIds])] } : c
          );
        }

        // fire and forget write file - could break the file but it's under source control :)
        writeFile(catsFileName, JSON.stringify(newCats));
        categories$.next(newCats);

        return newCats.find((c) => c.id === nextId);
      })
    )
    .toPromise();
}
