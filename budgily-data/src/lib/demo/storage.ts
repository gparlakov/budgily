import { MovementFilter, Pagination, Sort } from '../../generated/graphql';
import { filterValueAllCategories, filterValueNoCategory } from '../core/types';

export interface DemoCategory {
  id: string;
  name: string;
}
export type DemoMovement = Omit<MovementRaw, 'date'> & {
  date: Date;
};
export type MovementRaw = {
  id: string;
  amount: number;
  description: string;
  type: 'Credit' | 'Debit';
  date: string;
  month: string;
  categories: DemoCategory[];
};

export type MovementsDemoFilter = Omit<MovementFilter, 'fromDate' | 'toDate'> & {
  from?: Date;
  to?: Date;
};
const invalidDate = new Date('invalid').toString();
export function isValidDate(d: Date): d is Date {
  return d != null && typeof d === 'object' && 'getUTCDate' in d && d.toString() != invalidDate;
}

type Filter = (m: DemoMovement) => boolean;

const movementsKey = 'all-movements';
const movementsWellknown = '/mock-data.json';
const categoriesKey = 'all-categories';

export function getMovementsFromLocalStorageOrWellKnown(
  { from, categories, to, search, amountMin, amountMax, id }: MovementsDemoFilter | undefined = {},
  { field, desc }: { field?: string; desc?: boolean } | undefined = {},
  { page, size }: { page?: number; size?: number } | undefined = {}
): Promise<{ data?: { movements: { movements: DemoMovement[]; page: Pagination; sort: Sort } }; errors?: unknown[] }> {
  return (
    Promise.resolve()
      .then(() => {
        const all = window.localStorage.getItem(movementsKey);
        if (typeof all === 'string' && all.length > 0) {
          return JSON.parse(all) as MovementRaw[];
        } else {
          return fetch(movementsWellknown)
            .then((d) => d.json())
            .then((d) => {
              window.localStorage.setItem(movementsKey, JSON.stringify(d));
              return d as MovementRaw[];
            });
        }
      })
      // map date
      .then((rawMovements) => rawMovements.map((v): DemoMovement => ({ ...v, date: new Date(v.date) })))
      // filter
      .then((movements) => {
        const passThrough = () => true;
        const idFilter = Array.isArray(id) ? (m: DemoMovement) => id.includes(m.id) : passThrough;

        const amountMinFilter =
          typeof amountMin === 'number' && amountMin > 0 ? (m: DemoMovement) => m.amount >= amountMin : passThrough;
        const amountMaxFilter =
          typeof amountMax === 'number' && amountMax > 0 ? (m: DemoMovement) => m.amount <= amountMax : passThrough;

        let fromDateFilter: Filter = passThrough;
        if (from != null && isValidDate(from)) {
          const fromAsMillis = from.valueOf();
          fromDateFilter = (m: DemoMovement) => m.date != null && m.date.valueOf() > fromAsMillis;
        }

        let toDateFilter: Filter = passThrough;
        if (to != null && isValidDate(to)) {
          const toAsMillis = to.valueOf();
          toDateFilter = (m: DemoMovement) => m.date != null && m.date.valueOf() < toAsMillis;
        }

        let searchFilter: Filter = passThrough;
        if (typeof search === 'string') {
          const r = new RegExp(search, 'i');
          searchFilter = (m) => m != null && r.test(`${m.amount} ${m.type} ${m.description}`);
        }

        let categoryFilter: Filter = passThrough;
        if (Array.isArray(categories) && categories.filter((c) => c != filterValueAllCategories).length > 0) {
          const isAll = categories.includes(filterValueAllCategories);
          const isNone = categories.includes(filterValueNoCategory);

          const cats = categories.filter((c) => c != filterValueAllCategories && c != filterValueNoCategory);
          const isCategory = cats.length > 0;

          categoryFilter = (m) => {
            return (
              isAll ||
              (isNone && (m.categories == null || m.categories.length === 0)) ||
              (isCategory && m.categories?.some((c) => cats.includes(c.id.toString())))
            );
          };
        }

        return movements
          .filter(idFilter)
          .filter(amountMinFilter)
          .filter(amountMaxFilter)
          .filter(categoryFilter)
          .filter(fromDateFilter)
          .filter(toDateFilter)
          .filter(searchFilter);
      })
      // sort
      .then((filteredMovements) => {
        let sorter: ((a: DemoMovement, b: DemoMovement) => number) | undefined;

        const sortableString: Array<keyof DemoMovement> = ['description', 'type'];
        const isSortable = (k: unknown): k is 'description' | 'type' => {
          return typeof k === 'string' && sortableString.some((s) => s === k);
        };

        if (isSortable(field)) {
          sorter = (a: DemoMovement, b: DemoMovement) =>
            a[field] == null ? (b[field] == null ? 0 : -1) : a[field].localeCompare(b[field]);
        }

        if (field === 'amount') {
          sorter = (a: DemoMovement, b: DemoMovement) =>
            a.amount == null ? (b.amount == null ? 0 : -1) : a.amount - b.amount;
        }

        if (field === 'date') {
          sorter = (a, b) => (!isValidDate(a.date) ? (!isValidDate(b.date) ? 0 : -1) : Number(a.date) - Number(b.date));
        }

        return sorter != null && typeof sorter === 'function'
          ? filteredMovements.sort((a, b) => (desc ? sorter!(b, a) : sorter!(a, b)))
          : filteredMovements;
      })
      // paginate
      .then((filteredAndSorted) => {
        const results = filteredAndSorted.length ?? 0;
        const zeroBasedPage = Number(page) - 1 < 0 ? 0 : Number(page) - 1;

        const itemsPerPage = size != null && Number(size) > 0 && Number(size) < results ? Number(size) : results;
        const currentPageNumber = results > 0 && size != null && size * zeroBasedPage < results ? zeroBasedPage + 1 : 1;
        const countReturning =
          itemsPerPage * currentPageNumber < results ? itemsPerPage : results - itemsPerPage * (currentPageNumber - 1);

        const startIndex = (currentPageNumber - 1) * itemsPerPage;
        const endIndex = startIndex + countReturning + 1;

        return {
          data: {
            movements: {
              movements: filteredAndSorted.slice(startIndex, endIndex),
              sort: { field: field ?? 'date', desc },
              page: {
                currentPage: currentPageNumber,
                pageCount: itemsPerPage,
                totalCount: results,
                count: countReturning,
              },
            },
          },
        };
      })
  );
}

export function getCategoriesFromLocalStorageOrEmpty(): Promise<DemoCategory[]> {
  return Promise.resolve().then(() => {
    const local = window.localStorage.getItem(categoriesKey);
    if (typeof local === 'string') {
      return JSON.parse(local);
    } else {
      return [];
    }
  });
}

export function getMovementById(id: string): Promise<DemoMovement | undefined> {
  return getMovementsFromLocalStorageOrWellKnown({id: [id]}).then(r => (r.data?.movements?.movements ?? [])[0])
}



// export function getCategoriesByMovement(parent: Movement) {
//   return categories$
//     .pipe(
//       take(1),
//       map((cs) =>
//         parent != null
//           ? cs.filter((c) => (Array.isArray(c.movementIds) ? c.movementIds.includes(parent.id) : false))
//           : cs
//       )
//     )
//     .toPromise();
// }

// export function categorize({ category, categoryId, movementIds }: Categorize) {
//   if (!Array.isArray(movementIds)) {
//     throw new Error(`Expected an array of movements but got ${movementIds}`);
//   }
//   if (typeof category === 'object' && category == null) {
//     throw new Error('Expected a category but got empty (null|undefined)');
//   }
//   if (typeof category === 'object' && category?.name == null) {
//     throw new Error('Can not create a category without a name');
//   }

//   return categories$
//     .pipe(
//       take(1),
//       map((cats) => {
//         if (typeof categoryId === 'number' && cats.find((c) => c.id === categoryId) == null) {
//           throw new Error(
//             `Could not find category with id ${categoryId}. Please create a new one or provide a correct category id`
//           );
//         }

//         const isNewCategory = typeof category === 'object' && Array.isArray(movementIds) && category?.name != null;
//         let nextId = categoryId;
//         let newCats: Category[];
//         if (isNewCategory) {
//           nextId = (max(cats.map((c) => c.id)) ?? 0) + 1;
//           newCats = [
//             ...cats,
//             {
//               ...category,
//               // next id
//               id: nextId,
//               // add movementIds to category (set makes for unique ids only)
//               movementIds: [...new Set([...movementIds, ...movementIds])],
//             },
//           ];
//         } else {
//           nextId = categoryId;
//           newCats = cats.map((c) =>
//             c.id === categoryId ? { ...c, movementIds: [...new Set([...c.movementIds, ...movementIds])] } : c
//           );
//         }

//         // fire and forget write file - could break the file but it's under source control :)
//         writeFile(catsFileName, JSON.stringify(newCats));
//         categories$.next(newCats);

//         return newCats.find((c) => c.id === nextId);
//       })
//     )
//     .toPromise();
// }

