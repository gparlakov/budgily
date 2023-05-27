import { Category, Movement, MutationResolvers, QueryResolvers } from '@codedoc1/budgily-data';
import { max } from 'd3';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { BehaviorSubject } from 'rxjs';
import { take, map } from 'rxjs/operators';

const categoriesFileName = 'categories.json';
const categories$ = new BehaviorSubject<Category[]>([]);

stat(categoriesFileName)
  .then(
    (v) => v.isFile(),
    () => false
  )
  .then((exists) => (exists ? readFile(categoriesFileName) : Buffer.from('[]')))
  .then((b) => JSON.parse(b.toString()))
  .catch((e) => {
    console.log('---error while reading categories', e);
    return [];
  })
  .then((categories) => {
    console.log('Categories in memory', categories);
    categories$.next(categories);
  });

export function getCategoriesByMovement(): QueryResolvers['categories'] {
  return (parent: Movement) => {
    return categories$
      .pipe(
        take(1),
        map((cs) =>
          parent != null
            ? cs.filter((c) => (Array.isArray(c.movementIds) ? c.movementIds.includes(parent.id) : false))
            : cs
        )
      )
      .toPromise();
  };
}

export function getAllCategories() {
  return categories$.value;
}

export function categorize(): MutationResolvers['categorize'] {
  return (_parent, args) => {
    const { category, categoryId, movementIds } = args.input;
    if (!Array.isArray(movementIds)) {
      throw new Error(`Expected an array of movements but got ${movementIds}`);
    }
    if (typeof category === 'object' && category == null) {
      throw new Error('Expected a category but got empty (null|undefined)');
    }
    if (typeof category === 'object' && category?.name == null) {
      throw new Error('Can not create a category without a name');
    }
    if (typeof categoryId === 'number' && categories$.value.find((c) => c.id === categoryId) == null) {
      throw new Error(
        `Could not find category with id ${categoryId}. Please create a new one or provide a correct category id`
      );
    }

    const cats = categories$.value;

    const isNewCategory = typeof category === 'object' && Array.isArray(movementIds) && category?.name != null;
    let id = categoryId;
    if (isNewCategory) {
      id = (max(cats.map((c) => c.id)) ?? 0) + 1;
      categories$.next([
        ...cats,
        {
          ...category,
          // next id
          id,
          // add movementIds to category (set makes for unique ids only)
          movementIds: [...new Set([...movementIds, ...movementIds])],
        },
      ]);
    } else {
      id = categoryId;
      categories$.next(
        cats.map((c) =>
          c.id === categoryId ? { ...c, movementIds: [...new Set([...c.movementIds, ...movementIds])] } : c
        )
      );
    }

    // fire and forget write file - could break the file but
    writeFile(categoriesFileName, JSON.stringify(categories$.value));

    return categories$.value.find((c) => c.id === id);
  };
}
