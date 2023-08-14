import { MovementFilter, Pagination, Sort } from '../../generated/graphql';

export type Movement = {
  amount: number;
  description: string;
  date: Date;
  type: 'Credit' | 'Debit';
  id: string;
  month: string;
}
export type MovementRaw = {
  id: string;
  amount: number;
  description: string;
  type: 'Credit' | 'Debit';
  date: string;
  month: string;
}

export type MovementsFilter = Omit<MovementFilter, 'fromDate' | 'toDate'> & {
  from?: Date;
  to?: Date;
};
const invalidDate = new Date('invalid').toString();
export function isValidDate(d: Date): d is Date {
  return (d != null && typeof d === 'object' && 'getUTCDate' in d && d.toString() != invalidDate);
}

type Filter = (m: Movement) => boolean;

export function getMovementsFromLocalStorage(
  controller?: AbortController
): (
  filter?: MovementsFilter,
  sort?: { field?: string; desc?: boolean },
  page?: { page?: number; size?: number }
) => Promise<{ data?: { movements: { movements: Movement[]; page: Pagination; sort: Sort } }; errors?: unknown[] }> {
  return ({ from, categories, to, search, amountMin, amountMax,id } = {}, { field, desc } = {}, { page, size } = {}) => {

    Promise.resolve()
    .then(() => {

      const all = window.localStorage.getItem(storageKey());
      if (typeof all === 'string' && all.length > 0) {
        return JSON.parse(all) as MovementRaw[];
      } else {
        return fetch('mock-data.json')
        .then((d) => d.json())
        .then((d) => {
          window.localStorage.setItem(storageKey(), d);
          return d as MovementRaw[];
        });
      }
    })
    .then(vs => vs.map((v): Movement => ({...v, date: new Date(v.date)})))
    .then(vs => {


    const { page:currentPage , size:pageCount } = {page, size};


    const passThrough = () => true;
    const idFilter = Array.isArray(id) ? (m: Movement) => id.includes(m.id) : passThrough;

    const amountMinFilter = typeof amountMin === 'number' && amountMin > 0 ? (m: Movement) => m.amount >= amountMin : passThrough;
    const amountMaxFilter = typeof amountMax === 'number' && amountMax > 0 ? (m: Movement) => m.amount <= amountMax : passThrough;

    let fromDateFilter: Filter = passThrough;
    if (from != null && isValidDate(from)) {
      const fromAsMillis = from.valueOf();
      fromDateFilter = (m: Movement) => m.date != null && m.date.valueOf() > fromAsMillis;
    }

    let toDateFilter: Filter = passThrough;
    if (to != null && isValidDate(to)) {
      const toAsMillis = to.valueOf();
      toDateFilter = (m: Movement) => m.date != null && m.date.valueOf() < toAsMillis;
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

    return loadMovements()
      .then(async (ms) => {
        // include cats so we can filter by them
        const cats = await getAllCategories() ?? [];
        return ms.map((m) => {
          m.categories = cats
            .filter((c) => c.movementIds.includes(m.id))
            .map(({ id, name }) => ({ id, name, movementIds: [] }));
          return m;
        });
      })
      .then((ms) =>
        ms
          .filter(idFilter)
          .filter(amountMinFilter)
          .filter(amountMaxFilter)
          .filter(categoryFilter)
          .filter(fromDateFilter)
          .filter(toDateFilter)
          .filter(searchFilter)
      )
      .then((ms) => {
        let sorter: (a: Movement, b: Movement) => number;

        if(sortableString.includes(field as keyof Movement)) {
          sorter = (a: Movement, b: Movement) => a[field] == null ? b[field] == null ? 0 : -1 : (a[field] as string).localeCompare(b[field]);
        }

        if(field === 'amount') {
          sorter = (a: Movement, b: Movement) => a.amount == null ? b.amount == null ? 0 : -1 : a.amount - b.amount;
        }

        if(field === 'date') {
          sorter = (a, b) => !isValidDate(a.date) ? !isValidDate(b.date) ? 0 : -1 : Number(a.date) - Number(b.date)
        }

        return typeof sorter === 'function' ?  ms.sort((a, b) => desc ? sorter(b, a) : sorter(a, b)) : ms;
      })
      .then((r) => {
        const results = r.length ?? 0;
        const zeroBasedPage = Number(currentPage) - 1 < 0 ? 0 : Number(currentPage) - 1;

        const itemsPerPage = perPage != null && Number(perPage) > 0 && Number(perPage) < results ? Number(perPage) : results;
        const currentPageNumber = results > 0 && perPage * zeroBasedPage < results ? zeroBasedPage + 1 : 1;
        const countReturning = itemsPerPage * currentPageNumber < results ? itemsPerPage : results - (itemsPerPage * (currentPageNumber - 1));

        const startIndex = (currentPageNumber - 1 ) * itemsPerPage;
        const endIndex = startIndex + countReturning + 1;

        return {
          movements: r.slice(startIndex, endIndex),
          sort: args.sort,
          page: { currentPage: currentPageNumber, pageCount: itemsPerPage, totalCount: results, count: countReturning },
        } as MovementsQueryResponse;
      });
    })
  };
}

function storageKey(): string {
  return 'all-movements';
}
//   export function getMovementById(clientContext: ClientContextType, controller?: AbortController) {
//     return (id: string) => {
//       return gqlCall<{ movements: { movements: Movement[] } }>(
//         JSON.stringify({
//           query: `
//           query GetAllMovements {
//             movements(filter: {id: ["${id}"]}) {
//               movements {
//                 id,
//                 account
//                 amount
//                 date
//                 description
//                 opposite
//                 type
//                 raw
//                 categories {
//                   description
//                   movementIds
//                   name
//                   id
//                 }
//               }
//             }
//           }
//       `,
//         }),
//         clientContext,
//         controller
//       );
//     };
//   }
